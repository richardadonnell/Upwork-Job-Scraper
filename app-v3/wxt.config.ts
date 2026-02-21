import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Upwork Job Scraper',
    version: '3.0.0',
    description: 'Automatically scrape Upwork job listings and send them to a webhook.',
    permissions: ['storage', 'tabs', 'scripting', 'alarms', 'notifications'],
    host_permissions: ['https://www.upwork.com/*'],
    action: {
      default_title: 'Upwork Job Scraper',
      default_icon: {
        16: 'icon/16.png',
        32: 'icon/32.png',
        48: 'icon/48.png',
        96: 'icon/96.png',
        128: 'icon/128.png',
      },
    },
  },
});
