import { addToActivityLog } from './activity_log.js';

export function sendToWebhook(newJobs) {
  const webhookUrl = 'https://your-webhook-url.com';

  if (!webhookUrl || !isValidUrl(webhookUrl)) {
    console.error('Invalid webhook URL');
    addToActivityLog('Failed to send jobs to webhook: Invalid URL');
    return;
  }

  const payload = {
    content: `Found ${newJobs.length} new job(s)`,
    embeds: newJobs.map((job) => ({
      title: job.title,
      url: job.url,
      description: job.description,
      // Add more job details as needed
    })),
  };

  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (response.ok) {
        addToActivityLog(`Successfully sent ${newJobs.length} new job(s) to webhook`);
      } else {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }
    })
    .catch((error) => {
      console.error('Error sending webhook:', error);
      addToActivityLog(`Failed to send ${newJobs.length} new job(s) to webhook`);
    });
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}