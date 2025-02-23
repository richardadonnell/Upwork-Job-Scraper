function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Utility functions for managing search-webhook pairs

// Generate a unique ID for new pairs
function generateUniqueId() {
  return `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate a search-webhook pair
function validatePair(pair) {
  if (!pair.id || typeof pair.id !== "string") {
    throw new Error("Invalid pair ID");
  }
  if (!pair.name || typeof pair.name !== "string") {
    throw new Error("Pair name is required");
  }

  // Both URLs must be either empty or valid together
  const hasSearchUrl = Boolean(pair.searchUrl);
  const hasWebhookUrl = Boolean(pair.webhookUrl);

  // For new pairs, allow both to be empty
  if (!hasSearchUrl && !hasWebhookUrl) {
    // This is fine for a new pair
  }
  // If one URL is set, the other must also be set
  else if (hasSearchUrl !== hasWebhookUrl) {
    throw new Error(
      "Search URL and Webhook URL must be set together. Please provide both URLs or leave both empty."
    );
  }
  // If both are set, validate their formats
  else {
    if (!pair.searchUrl.startsWith("https://www.upwork.com/nx/search/jobs/?")) {
      throw new Error(
        "Invalid search URL format. Must be an Upwork job search URL."
      );
    }
    if (!pair.webhookUrl.startsWith("http")) {
      throw new Error(
        "Invalid webhook URL format. Must start with http:// or https://"
      );
    }
  }

  if (typeof pair.enabled !== "boolean") {
    throw new Error("Invalid enabled state");
  }

  return true;
}

// Default pair structure
function createDefaultPair(
  name = "New Search",
  searchUrl = "",
  webhookUrl = ""
) {
  return {
    id: generateUniqueId(),
    name: name,
    searchUrl: searchUrl,
    webhookUrl: webhookUrl,
    enabled: true,
  };
}

// Export functions using globalThis
globalThis.isValidUrl = isValidUrl;
globalThis.generateUniqueId = generateUniqueId;
globalThis.validatePair = validatePair;
globalThis.createDefaultPair = createDefaultPair;
