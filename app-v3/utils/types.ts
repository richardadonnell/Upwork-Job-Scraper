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

export interface Settings {
  masterEnabled: boolean;
  searchUrl: string;
  checkFrequency: {
    days: number;
    hours: number;
    minutes: number;
  };
  webhookEnabled: boolean;
  webhookUrl: string;
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
