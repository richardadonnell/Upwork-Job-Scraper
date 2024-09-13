function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function sendToWebhook(webhookUrl, jobs) {
  try {
    if (!webhookEnabled) {
      addToActivityLog("Webhook is disabled. Skipping send.");
      return;
    }

    if (!isValidUrl(webhookUrl)) {
      addToActivityLog("Invalid webhook URL. Skipping send.");
      return;
    }

    addToActivityLog(`Sending job to webhook...`);
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobs),
    })
      .then((response) => response.text())
      .then((result) => {
        console.log("Webhook response:", result);
        addToActivityLog("Webhook sent successfully");
      })
      .catch((error) => {
        console.error("Error:", error);
        addToActivityLog("Error sending webhook");
      });
  } catch (error) {
    window.logAndReportError("Error in sendToWebhook", error);
  }
}
