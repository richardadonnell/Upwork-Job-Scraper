export interface Job {
  uid: string;
  title: string;
  url: string;
  datePosted: string;
  description: string;
  jobType: string;
  budget: string;
  experienceLevel: string;
  skills: string[];
  paymentVerified: boolean;
  clientRating: string;
  clientTotalSpent: string;
  proposals: string;
  scrapedAt: string;
}

export interface SearchTarget {
  id: string;
  searchUrl: string;
  webhookEnabled: boolean;
  webhookUrl: string;
}

export interface Settings {
  masterEnabled: boolean;
  searchTargets: SearchTarget[];
  checkFrequency: {
    days: number;
    hours: number;
    minutes: number;
  };
  notificationsEnabled: boolean;
  lastRunAt: string | null;
  lastRunStatus: 'success' | 'error' | 'logged_out' | null;
}

export interface ScrapeResult {
  ok: boolean;
  jobs?: Job[];
  reason?: 'logged_out' | 'no_results' | 'error';
  error?: string;
}

export type MessageType =
  | { type: 'manualScrape' }
  | { type: 'settingsUpdated' };
