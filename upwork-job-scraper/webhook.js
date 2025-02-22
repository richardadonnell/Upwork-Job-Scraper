function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function sendToWebhook(webhookUrl, jobs) {
  const opId = startOperation("sendToWebhook");
  return new Promise((resolve, reject) => {
    try {
      if (!webhookUrl || !isValidUrl(webhookUrl)) {
        const error = new Error("Invalid webhook URL");
        addOperationBreadcrumb(
          "Invalid webhook URL detected",
          { url: webhookUrl },
          "error"
        );
        console.error("Webhook error:", error);
        addToActivityLog("Invalid webhook URL. Skipping send.");
        reject(error);
        return;
      }

      addOperationBreadcrumb("Preparing webhook request", {
        url: webhookUrl,
        jobCount: jobs.length,
        firstJobTitle: jobs[0]?.title,
      });

      console.log("Sending webhook request:", {
        url: webhookUrl,
        jobCount: jobs.length,
        firstJobTitle: jobs[0]?.title,
      });

      addToActivityLog(
        `Attempting to send ${jobs.length} job(s) to webhook...`
      );

      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobs),
      })
        .then((response) => {
          if (!response.ok) {
            addOperationBreadcrumb(
              "Webhook request failed",
              {
                status: response.status,
                statusText: response.statusText,
              },
              "error"
            );
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          addOperationBreadcrumb("Webhook request successful", {
            status: response.status,
          });
          return response.text();
        })
        .then((result) => {
          console.log("Webhook response:", result);
          addToActivityLog("Webhook sent successfully");
          addOperationBreadcrumb("Webhook completed successfully", {
            response: result,
          });
          resolve(result);
        })
        .catch((error) => {
          addOperationBreadcrumb(
            "Webhook request failed",
            {
              error: error.message,
            },
            "error"
          );
          console.error("Webhook request failed:", error);
          addToActivityLog(`Error sending webhook: ${error.message}`);
          logAndReportError("Error sending webhook", error, {
            webhookUrl,
            jobCount: jobs.length,
          });
          reject(error);
        })
        .finally(() => {
          endOperation();
        });
    } catch (error) {
      addOperationBreadcrumb(
        "Fatal error in sendToWebhook",
        {
          error: error.message,
        },
        "error"
      );
      console.error("Error in sendToWebhook:", error);
      logAndReportError("Error in sendToWebhook", error, {
        webhookUrl,
        jobCount: jobs.length,
      });
      addToActivityLog(`Error in sendToWebhook: ${error.message}`);
      reject(error);
      endOperation();
    }
  });
}
