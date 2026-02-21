import type { Job, ScrapeResult } from '../utils/types';

export default defineContentScript({
  matches: ['https://www.upwork.com/*'],
  registration: 'runtime',

  main(): ScrapeResult {
    const jobTiles = document.querySelectorAll<HTMLElement>('article[data-ev-job-uid]');

    if (jobTiles.length === 0) {
      const hasLoginLink =
        document.querySelector('a[href*="/login"]') !== null ||
        document.querySelector('button[data-qa="login-button"]') !== null;
      if (hasLoginLink) {
        return { ok: false, reason: 'logged_out' };
      }
      return { ok: false, reason: 'no_results' };
    }

    const jobs: Job[] = [];

    jobTiles.forEach((article) => {
      try {
        const uid = article.dataset.evJobUid ?? '';

        const titleEl =
          article.querySelector<HTMLAnchorElement>('[data-test="job-tile-title-link"]') ??
          article.querySelector<HTMLAnchorElement>('.job-tile-title a') ??
          article.querySelector<HTMLAnchorElement>('h2.job-tile-title a') ??
          article.querySelector<HTMLAnchorElement>('h2 a[href*="/jobs/"]') ??
          article.querySelector<HTMLAnchorElement>('a[href*="/jobs/"]');

        const fallbackTitleEl =
          article.querySelector<HTMLElement>('.job-tile-title') ??
          article.querySelector<HTMLElement>('[data-test="job-title"]') ??
          article.querySelector<HTMLElement>('h2');

        const title = titleEl?.textContent?.trim() || fallbackTitleEl?.textContent?.trim() || '';

        const href = titleEl?.getAttribute('href')?.trim() ?? '';
        let url = '';
        if (href) {
          try {
            url = new URL(href, 'https://www.upwork.com').toString();
          } catch {
            url = '';
          }
        }

        // Note: Upwork has a typo in their attribute name ("pubilshed" not "published") — intentional
        const dateEl = article.querySelector('[data-test="job-pubilshed-date"]');
        const dateSpans = dateEl?.querySelectorAll('span');
        const datePosted = dateSpans && dateSpans.length > 1
          ? dateSpans[dateSpans.length - 1]?.textContent?.trim() ?? ''
          : dateEl?.textContent?.trim() ?? '';

        const descEl = article.querySelector('.air3-line-clamp-wrapper.clamp p');
        const description = descEl?.textContent?.trim() ?? '';

        const jobTypeEl = article.querySelector('[data-test="job-type-label"]');
        const jobType = jobTypeEl?.textContent?.trim() ?? '';

        const fixedBudgetEl = article.querySelector('[data-test="is-fixed-price"] strong.rr-mask');
        const hourlyBudgetEl = article.querySelector('[data-test="is-hourly"] strong.rr-mask');
        const budget = (fixedBudgetEl ?? hourlyBudgetEl)?.textContent?.trim() ?? '';

        const expEl = article.querySelector('[data-test="experience-level"]');
        const experienceLevel = expEl?.textContent?.trim() ?? '';

        const skillEls = article.querySelectorAll('[data-test="token"] span');
        const skills = Array.from(skillEls).map((el) => el.textContent?.trim() ?? '').filter(Boolean);

        const paymentVerified = article.querySelector('[data-test="payment-verified"]') !== null;

        const ratingEl = article.querySelector('[data-test="total-feedback"] .air3-rating-value-text');
        const clientRating = ratingEl?.textContent?.trim() ?? '';

        const spentEl = article.querySelector('[data-test="total-spent"] strong.rr-mask');
        const clientTotalSpent = spentEl?.textContent?.trim() ?? '';

        const proposalsEl = article.querySelector('[data-test="proposals-tier"] strong');
        const proposals = proposalsEl?.textContent?.trim() ?? '';

        jobs.push({
          uid,
          title,
          url,
          datePosted,
          description,
          jobType,
          budget,
          experienceLevel,
          skills,
          paymentVerified,
          clientRating,
          clientTotalSpent,
          proposals,
          scrapedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Upwork Scraper] Error parsing job tile:', err);
      }
    });

    return { ok: true, jobs };
  },
});
