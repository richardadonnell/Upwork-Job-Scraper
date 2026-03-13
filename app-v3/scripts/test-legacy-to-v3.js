(async () => {
  // Optional backup
  const backup = await chrome.storage.sync.get(["settings"]);
  console.log("backup", backup);

  // Reset v3 state so migration can run
  await chrome.storage.sync.remove(["settings"]);
  await chrome.storage.local.remove([
    "legacyV1MigrationApplied",
    "seenJobIds",
    "jobHistory",
  ]);

  // Seed legacy v1-style sync keys
  await chrome.storage.sync.set({
    searchWebhookPairs: [
      {
        id: "legacy-1",
        name: "Legacy Target 1",
        searchUrl: "https://www.upwork.com/nx/search/jobs/?sort=recency&page=1&per_page=50&q=react",
        webhookUrl: "https://example.com/webhook-legacy",
        enabled: true,
      },
    ],
    jobScrapingEnabled: true,
    checkFrequency: 15,
    notificationsEnabled: true,
    schedule: {
      days: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: false },
      startTime: "08:00",
      endTime: "18:00",
    },
  });

  // Seed legacy local jobs
  await chrome.storage.local.set({
    scrapedJobs: [
      {
        title: "Legacy React Job",
        url: "https://www.upwork.com/jobs/~01legacyjob",
        jobType: "Fixed price",
        skillLevel: "Intermediate",
        budget: "$300",
        description: "Legacy description",
        skills: ["React"],
        paymentVerified: true,
        clientRating: "4.8",
        clientSpent: "$5k+ spent",
        scrapedAt: Date.now() - 3600000,
        scrapedAtHuman: new Date(Date.now() - 3600000).toLocaleString(),
      },
    ],
  });

  console.log("Seeded. Now reload extension from chrome://extensions");
})();