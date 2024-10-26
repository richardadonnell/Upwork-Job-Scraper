function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function sendToWebhook(webhookUrl, jobs) {
  return new Promise((resolve, reject) => {
    try {
      if (!webhookUrl || !isValidUrl(webhookUrl)) {
        const error = new Error("Invalid webhook URL");
        console.error("Webhook error:", error);
        addToActivityLog("Invalid webhook URL. Skipping send.");
        reject(error);
        return;
      }

      console.log("Sending webhook request:", {
        url: webhookUrl,
        jobCount: jobs.length,
        firstJobTitle: jobs[0]?.title
      });

      addToActivityLog(`Attempting to send ${jobs.length} job(s) to webhook...`);
      
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobs),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((result) => {
          console.log("Webhook response:", result);
          addToActivityLog("Webhook sent successfully");
          resolve(result);
        })
        .catch((error) => {
          console.error("Webhook request failed:", error);
          addToActivityLog(`Error sending webhook: ${error.message}`);
          logAndReportError("Error sending webhook", error);
          reject(error);
        });
    } catch (error) {
      console.error("Error in sendToWebhook:", error);
      logAndReportError("Error in sendToWebhook", error);
      addToActivityLog(`Error in sendToWebhook: ${error.message}`);
      reject(error);
    }
  });
}
