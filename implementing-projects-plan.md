# Upwork Job Scraper - Projects Feature Implementation Plan

## Feature Overview
Enable users to create and manage multiple "projects", each with its own feed source, webhook, and scraped jobs list. This allows users to organize different job searches independently.

## Requirements Discussion

### Project Data Structure
```typescript
interface Project {
  id: string;           // Unique identifier
  name: string;         // User-given name (can be non-unique)
  enabled: boolean;     // Enable/disable status
  feedUrl: string;      // Upwork feed URL
  webhookUrl: string;   // Webhook destination
  lastScraped?: Date;   // Last successful scrape
}
```

### Storage & Configuration
- Store all project data locally in Chrome extension storage
- No limit on number of projects
- Namespace scraped jobs by project ID
- Retain jobs even when project is disabled
- No automatic job clearing
- Store maximum 100 most recent jobs per project
- Handle storage quota exceeded gracefully with user notification

### Project Management
- Project Creation:
  - New projects disabled by default
  - Reuse existing feed URL validation logic
  - Generate unique project ID
  - Project names can be duplicate (IDs ensure uniqueness)
  - Webhook URL validation (if any)
- Project Deletion:
  - Delete button at bottom of expanded project view
  - Reuse existing confirmation dialog pattern (like clear jobs)
  - Prevent deletion of actively scraping projects
  - Retain job history until explicit cleanup

### UI/UX (Chrome Extension Settings Page)
- Projects section with list of all projects
- "Add New Project" button at top
- Collapsible/expandable project cards showing:
  - Project name
  - Enable/disable toggle (green for enabled, gray for disabled)
  - Number of jobs (in collapsed view, max 100)
  - Countdown timer to next scrape (in collapsed view)
  - Status indicator for currently scraping
- Expanded project view shows:
  - All project settings
  - Scraped jobs list (most recent 100 jobs)
  - Delete button at bottom with confirmation
- Continue using existing activity log for status/errors
- No popup UI needed (staying with current approach)

### Scraping Behavior
- Sequential scraping (one project at a time)
- Queue based on project ID (lowest first)
- Only enabled projects enter queue
- Global rate limiting across all projects
- Sentry integration for error reporting
- Project name included in webhook payload
- Handle rate limiting across all enabled projects

### Migration Strategy
- Automatic migration for existing users:
  - Create "Default Project" from current settings
  - Copy existing feed URL and webhook URL
  - Keep existing enable/disable state
  - Move current scraped jobs to default project
  - Maintain current scraping schedule
- Zero downtime migration:
  - No interruption to active scraping
  - Preserve all existing functionality
  - Keep current job history
- Migration Logging:
  - Log migration start/completion
  - Report any issues in activity log
  - Notify user of successful migration

## Implementation Plan

### Phase 1: Data Structure & Storage
1. Create Project interface and types
2. Implement project storage functions
3. Modify job storage to use project namespacing
4. Add migration logic for existing settings/jobs
5. Implement per-project job limit (100 jobs)

### Phase 2: Project Management
1. Implement project CRUD operations:
   - Create new project (disabled by default)
   - Read project details
   - Update project settings
   - Delete project with confirmation dialog
2. Reuse existing URL validation logic
3. Implement enable/disable functionality
4. Add safeguards for active project deletion

### Phase 3: UI Components
1. Create projects section in settings page
2. Implement collapsible project cards
3. Add project status indicators
4. Create project form components
5. Reuse confirmation dialog for deletion
6. Implement countdown timer display
7. Add storage quota notifications
8. Add migration status indicators

### Phase 4: Scraping Logic
1. Modify scraping system to handle multiple projects
2. Implement project queue management
3. Update rate limiting to work across projects
4. Modify webhook payload to include project info
5. Update error handling and Sentry integration
6. Implement active scraping indicators
7. Ensure 100 job limit per project

### Phase 5: Testing & Refinement
1. Test project management functionality
2. Verify scraping behavior across projects
3. Test storage limits and job count limits
4. Validate webhook integration
5. Test migration process thoroughly
6. Verify existing user migration path
7. Test rate limiting across projects
8. User testing and feedback

## Future Considerations
- Aggregated statistics across projects
- Enhanced webhook failure handling
- Configurable job retention limits
- Storage quota management
- Project import/export functionality
- Project sorting/filtering options
- Batch project operations
- Enhanced project analytics
