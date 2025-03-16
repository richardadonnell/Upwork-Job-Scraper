// Storage management for search-webhook pairs

// Get all search-webhook pairs
async function getAllPairs() {
  const data = await chrome.storage.sync.get("searchWebhookPairs");
  return data.searchWebhookPairs || [];
}

// Get enabled pairs only
async function getEnabledPairs() {
  const pairs = await getAllPairs();
  return pairs.filter((pair) => pair.enabled);
}

// Add a new pair
async function addPair(name, searchUrl, webhookUrl) {
  const pair = {
    id: Date.now().toString(),
    name: name || "New Configuration",
    searchUrl: searchUrl || "https://www.upwork.com/nx/search/jobs/?sort=recency",
    webhookUrl: webhookUrl || "",
    enabled: true,
    createdAt: new Date().toISOString()
  };

  validatePair(pair);

  const pairs = await getAllPairs();
  pairs.push(pair);

  await chrome.storage.sync.set({ searchWebhookPairs: pairs });
  return pair;
}

// Update an existing pair
async function updatePair(id, updates) {
  const pairs = await getAllPairs();
  const index = pairs.findIndex((pair) => pair.id === id);

  if (index === -1) {
    throw new Error("Pair not found");
  }

  const updatedPair = { ...pairs[index], ...updates };
  validatePair(updatedPair);

  pairs[index] = updatedPair;
  await chrome.storage.sync.set({ searchWebhookPairs: pairs });
  return updatedPair;
}

// Remove a pair
async function removePair(id) {
  const pairs = await getAllPairs();
  const filteredPairs = pairs.filter((pair) => pair.id !== id);

  if (filteredPairs.length === pairs.length) {
    throw new Error("Pair not found");
  }

  await chrome.storage.sync.set({ searchWebhookPairs: filteredPairs });
}

// Toggle pair enabled state
async function togglePair(id) {
  const pairs = await getAllPairs();
  const pair = pairs.find((p) => p.id === id);

  if (!pair) {
    throw new Error("Pair not found");
  }

  return await updatePair(id, { enabled: !pair.enabled });
}

// Validate pair data
function validatePair(pair) {
  if (!pair || typeof pair !== 'object') {
    throw new Error('Invalid pair object');
  }
  
  if (!pair.name || typeof pair.name !== 'string') {
    pair.name = "New Configuration";
  }
  
  if (!pair.searchUrl || typeof pair.searchUrl !== 'string') {
    pair.searchUrl = "https://www.upwork.com/nx/search/jobs/?sort=recency";
  }
  
  if (!pair.webhookUrl || typeof pair.webhookUrl !== 'string') {
    pair.webhookUrl = "";
  }
}

// Migrate from old storage format
async function migrateStorage() {
  const oldData = await chrome.storage.sync.get([
    "webhookUrl",
    "webhookEnabled",
    "customSearchUrl",
    "selectedFeedSource",
  ]);

  // Only migrate if old data exists and no pairs exist yet
  const existingPairs = await getAllPairs();
  if (existingPairs.length > 0) {
    return;
  }

  // Create initial pair from old data if it exists
  if (oldData.webhookUrl || oldData.customSearchUrl) {
    const searchUrl =
      oldData.customSearchUrl ||
      "https://www.upwork.com/nx/search/jobs/?sort=recency";
    await addPair(
      "Migrated Configuration",
      searchUrl,
      oldData.webhookUrl || ""
    );
  }

  // Clean up old storage
  await chrome.storage.sync.remove([
    "webhookUrl",
    "webhookEnabled",
    "customSearchUrl",
    "selectedFeedSource",
  ]);

  // Clear old jobs
  await chrome.storage.local.remove(["scrapedJobs"]);
}

// Export functions using globalThis
globalThis.getAllPairs = getAllPairs;
globalThis.getEnabledPairs = getEnabledPairs;
globalThis.addPair = addPair;
globalThis.updatePair = updatePair;
globalThis.removePair = removePair;
globalThis.togglePair = togglePair;
globalThis.migrateStorage = migrateStorage;
