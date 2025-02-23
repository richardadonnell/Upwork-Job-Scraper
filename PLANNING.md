DO NOT BREAK OR REMOVE ANY CURRENT FUNCTIONALITY. MAINTAIN ALL CURRENT CSS STYLES.

DO NOT MAKE ASSUMPTIONS ABOUT WHAT I NEED. ASK ME FOR ANYTHING YOU NEED.

ONLY WORK ON ONE THING AT A TIME. BE VERY PRECISE AND THOUGHTFUL ABOUT EACH STEP. DO NOT HALLUCINATE.

---

# Upwork Job Scraper Enhancement: Multiple Search-Webhook Pairs

## Overview
Enhance the Chrome extension to support multiple pairs of search URLs and webhook URLs, allowing users to monitor different job searches and send results to different webhooks.

## Requirements

### Core Features
- Allow unlimited search URL and webhook URL pairs
- Each pair should have:
  - Name for identification
  - Search URL
  - Webhook URL
  - Enable/disable toggle
- Combined job list in extension UI
- Include search source information in webhook payload
- Fully migrate from single URL system to new multi-pair system
- Share global notification settings across all pairs

### Data Structure
```javascript
// New storage structure
{
  "searchWebhookPairs": [
    {
      id: "unique-id",
      name: "Pair Name",
      searchUrl: "https://www.upwork.com/nx/search/jobs/?...",
      webhookUrl: "https://...",
      enabled: true
    }
    // ... more pairs
  ]
}

// Enhanced webhook payload
{
  // ... existing job data ...
  "source": {
    "name": "Pair Name",
    "searchUrl": "https://..."
  }
}
```

## Implementation Phases

### Phase 1: Data Structure and Storage
- [ ] Create new storage schema for search-webhook pairs
- [ ] Implement migration from old single-URL system
- [ ] Add utility functions for managing pairs
- [ ] Update background.js to handle new storage format

### Phase 2: UI Updates
- [ ] Design new UI section for managing pairs
- [ ] Add UI components:
  - [ ] Pair list view
  - [ ] Add/remove pair buttons
  - [ ] Fields for name, URLs, and toggle
  - [ ] Test webhook button per pair
  - [ ] Open search URL button per pair
- [ ] Update settings.js for new UI interactions

### Phase 3: Job Processing
- [ ] Update job scraping to handle multiple search URLs
- [ ] Modify webhook payload to include source information
- [ ] Update job processing to handle multiple webhooks
- [ ] Enhance error handling for multiple pairs

### Phase 4: Testing and Refinement
- [ ] Test migration from old to new system
- [ ] Test multiple search URLs
- [ ] Test webhook functionality
- [ ] Test enable/disable functionality
- [ ] Performance testing with multiple pairs

## Decisions Made

1. **Number of Pairs**: No limit on the number of pairs a user can create
2. **Job List Display**: Combined list in UI, with source tracking in webhook payload
3. **Migration Strategy**: Full migration to new system (no simple mode)
4. **Notification Settings**: Shared global settings across all pairs
5. **Duplicate Jobs**: No special handling needed for jobs found by multiple searches

## Next Steps
1. Begin with Phase 1: Data Structure and Storage
2. Create detailed technical specifications for each phase
3. Implement changes incrementally with testing at each step

## Questions/Concerns to Address
- Impact on performance with multiple search URLs
- Storage limits consideration for Chrome storage
- Error handling strategy for multiple webhook failures
- UI/UX for managing many pairs 