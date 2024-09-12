import { addToActivityLog } from './activity_log.js';
import { processJobs } from './job_processing.js';
import { loadFeedSourceSettings } from './feed_sources.js';
import { selectedFeedSource, customSearchUrl, jobScrapingEnabled } from './extension_state.js';
import { logAndReportError } from './error_handling.js';

export async function checkForNewJobs() {
  if (!jobScrapingEnabled) {
    addToActivityLog("Job scraping is disabled. Skipping job check.");
    return;
  }

  await loadFeedSourceSettings();

  addToActivityLog("Starting job check...");

  const url = selectedFeedSource === "custom-search" && customSearchUrl
    ? customSearchUrl
    : "https://www.upwork.com/nx/find-work/most-recent";

  try {
    const tab = await chrome.tabs.create({ url, active: false });
    const [{ result: jobs }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeJobs,
    });

    addToActivityLog(`Scraped ${jobs.length} jobs from ${url}`);
    await processJobs(jobs);
    await chrome.tabs.remove(tab.id);
    addToActivityLog("Job check completed for " + url);
  } catch (error) {
    logAndReportError('Error checking for new jobs', error);
  }
}

export function scrapeJobs() {
  const jobElements = document.querySelectorAll(
    'article.job-tile, [data-test="JobTile"]'
  );
  const jobs = Array.from(jobElements).map((jobElement) => {
    const titleElement = jobElement.querySelector(
      '.job-tile-title a, [data-test="job-tile-title-link"]'
    );
    const descriptionElement = jobElement.querySelector(
      '[data-test="job-description-text"], [data-test="UpCLineClamp JobDescription"]'
    );
    const jobInfoList = jobElement.querySelector('ul[data-test="JobInfo"]');
    const skillsElements = jobElement.querySelectorAll(
      '.air3-token-container .air3-token, [data-test="TokenClamp JobAttrs"] .air3-token'
    );
    const paymentVerifiedElement = jobElement.querySelector(
      '[data-test="payment-verified"], [data-test="payment-verification-status"]'
    );
    const clientRatingElement = jobElement.querySelector(
      ".air3-rating-value-text"
    );
    const clientSpendingElement = jobElement.querySelector(
      '[data-test="client-spendings"] strong, [data-test="client-spend"]'
    );
    const clientCountryElement = jobElement.querySelector(
      '[data-test="client-country"], [data-test="location"] .air3-badge-tagline'
    );
    const attachmentsElement = jobElement.querySelector(
      '[data-test="attachments"]'
    );
    const questionsElement = jobElement.querySelector(
      '[data-test="additional-questions"]'
    );

    let jobType, budget, hourlyRange, estimatedTime, skillLevel;

    if (jobInfoList) {
      const jobInfoItems = jobInfoList.querySelectorAll("li");
      jobInfoItems.forEach((item) => {
        if (item.getAttribute("data-test") === "job-type-label") {
          jobType = item.textContent.trim();
        } else if (item.getAttribute("data-test") === "experience-level") {
          skillLevel = item.textContent.trim();
        } else if (item.getAttribute("data-test") === "is-fixed-price") {
          budget = item.querySelector("strong:last-child").textContent.trim();
        } else if (item.getAttribute("data-test") === "duration-label") {
          estimatedTime = item
            .querySelector("strong:last-child")
            .textContent.trim();
        }
      });

      if (jobType && jobType.includes("Hourly")) {
        hourlyRange = jobType.split(":")[1].trim();
        jobType = "Hourly";
      } else if (jobType) {
        jobType = "Fixed price";
      }
    } else {
      // Fallback for Most Recent job feed structure
      const jobTypeElement = jobElement.querySelector(
        '[data-test="job-type"]'
      );
      if (jobTypeElement) {
        if (jobTypeElement.textContent.includes("Fixed-price")) {
          jobType = "Fixed price";
          const budgetElement = jobElement.querySelector(
            '[data-test="budget"]'
          );
          budget = budgetElement ? budgetElement.textContent.trim() : "N/A";
        } else if (jobTypeElement.textContent.includes("Hourly")) {
          jobType = "Hourly";
          const hourlyRangeElement = jobElement.querySelector(
            '[data-test="hourly-rate"]'
          );
          hourlyRange = hourlyRangeElement
            ? hourlyRangeElement.textContent.trim()
            : "N/A";
        }
      }

      const skillLevelElement = jobElement.querySelector(
        '[data-test="contractor-tier"]'
      );
      if (skillLevelElement) {
        skillLevel = skillLevelElement.textContent.trim();
      }

      const estimatedTimeElement = jobElement.querySelector(
        '[data-test="duration"]'
      );
      if (estimatedTimeElement) {
        estimatedTime = estimatedTimeElement.textContent.trim();
      }
    }

    const attachments = attachmentsElement
      ? Array.from(attachmentsElement.querySelectorAll("a")).map((a) => ({
          name: a.textContent.trim(),
          url: a.href,
        }))
      : [];

    const questions = questionsElement
      ? Array.from(questionsElement.querySelectorAll("li")).map((li) =>
          li.textContent.trim()
        )
      : [];

    const scrapedAt = Date.now();
    const humanReadableTime = new Date(scrapedAt).toLocaleString();

    let clientRating = "N/A";

    if (clientRatingElement) {
      if (clientRatingElement.classList.contains("air3-rating-value-text")) {
        // Custom Search URL feed
        clientRating = clientRatingElement.textContent.trim();
      } else {
        // Most Recent feed
        const ratingText = jobElement.querySelector(".sr-only");
        if (ratingText) {
          const match = ratingText.textContent.match(
            /Rating is (\d+(\.\d+)?) out of 5/
          );
          if (match) {
            clientRating = match[1];
          }
        }
      }
    }

    let clientCountry = "N/A";
    if (clientCountryElement) {
      // Remove any child elements (like the icon) and get only the text content
      const clone = clientCountryElement.cloneNode(true);
      for (const child of clone.children) {
        child.remove();
      }
      clientCountry = clone.textContent.trim().replace(/\s+/g, " ");
    }

    let paymentVerified = false;
    if (paymentVerifiedElement) {
      // Custom Search URL feed
      if (paymentVerifiedElement.textContent.includes("Payment verified")) {
        paymentVerified = true;
      }
      // Most Recent feed
      else if (
        paymentVerifiedElement.textContent.includes("Payment unverified")
      ) {
        paymentVerified = false;
      }
      // If neither text is found, we keep the default false value
    }

    let clientSpent = "N/A";
    const clientSpendingElementMostRecent = jobElement.querySelector(
      '[data-test="client-spendings"] strong'
    );
    const clientSpendingElementCustomSearch = jobElement.querySelector(
      '[data-test="total-spent"] strong'
    );

    if (clientSpendingElementMostRecent) {
      clientSpent =
        clientSpendingElementMostRecent.textContent.trim() + " spent";
    } else if (clientSpendingElementCustomSearch) {
      clientSpent =
        clientSpendingElementCustomSearch.textContent.trim() + " spent";
    }

    return {
      title: titleElement ? titleElement.textContent.trim() : "N/A",
      url: titleElement ? titleElement.href : "N/A",
      jobType: jobType || "N/A",
      skillLevel: skillLevel || "N/A",
      budget: budget || "N/A",
      hourlyRange: hourlyRange || "N/A",
      estimatedTime: estimatedTime || "N/A",
      description: descriptionElement
        ? descriptionElement.textContent.trim()
        : "N/A",
      skills: Array.from(skillsElements).map((skill) =>
        skill.textContent.trim()
      ),
      paymentVerified: paymentVerified,
      clientRating: clientRating,
      clientSpent: clientSpent,
      clientCountry: clientCountry,
      attachments: attachments,
      questions: questions,
      scrapedAt: scrapedAt,
      scrapedAtHuman: humanReadableTime,
    };
  });

  return jobs;
}