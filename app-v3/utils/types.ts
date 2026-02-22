export interface Job {
  uid: string;
  title: string;
  url: string;
  datePosted: string;
  postedAtMs?: number;
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
  name: string;
  searchUrl: string;
  webhookEnabled: boolean;
  webhookUrl: string;
}

export interface Settings {
  masterEnabled: boolean;
  searchTargets: SearchTarget[];
  minuteInterval: number;
  activeDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  timeWindow: {
    start: string;
    end: string;
  };
  notificationsEnabled: boolean;
  lastRunAt: string | null;
  lastRunStatus: 'success' | 'error' | 'logged_out' | 'captcha_required' | null;
}

export interface ScrapeResult {
  ok: boolean;
  jobs?: Job[];
  reason?: 'logged_out' | 'no_results' | 'error' | 'captcha_required';
  error?: string;
}

export type ActivityLogLevel = 'info' | 'warn' | 'error';

export interface ActivityLog {
  id: string;
  timestamp: number;
  level: ActivityLogLevel;
  event: string;
  detail?: string;
}

export type MessageType =
  | { type: 'manualScrape' }
  | { type: 'settingsUpdated' };

/** Example payload sent by the "Test" button in SettingsTab to verify webhook destinations. */
export const EXAMPLE_WEBHOOK_PAYLOAD: {
  status: 'success';
  targetName: string;
  jobs: Job[];
  timestamp: string;
} = {
  status: 'success',
  targetName: 'Example Target',
  jobs: [
    {
      uid: '~01exampleJobUid12345',
      title: 'Senior React Developer Needed',
      url: 'https://www.upwork.com/jobs/~01exampleJobUid12345',
      datePosted: 'Posted 2 hours ago',
      postedAtMs: Date.now() - 2 * 60 * 60 * 1000,
      description:
        'We are looking for an experienced React developer to help build a SaaS dashboard. ' +
        'You will work closely with our design team to implement pixel-perfect UI components, ' +
        'integrate REST APIs, and write clean, maintainable TypeScript code.',
      jobType: 'Fixed-price',
      budget: '$500',
      experienceLevel: 'Intermediate',
      skills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Tailwind CSS'],
      paymentVerified: true,
      clientRating: '4.95',
      clientTotalSpent: '$10k+',
      proposals: '10 to 15',
      scrapedAt: new Date().toISOString(),
    },
  ],
  timestamp: new Date().toISOString(),
};
