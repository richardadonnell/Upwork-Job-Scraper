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

      // Prepare jobs with source information
      const jobsWithSource = jobs.map((job) => ({
        ...job,
        source: job.source || {
          name: "Unknown Source",
          searchUrl: "N/A",
        },
      }));

      addOperationBreadcrumb("Preparing webhook request", {
        url: webhookUrl,
        jobCount: jobsWithSource.length,
        firstJobTitle: jobsWithSource[0]?.title,
        firstJobSource: jobsWithSource[0]?.source?.name,
      });

      console.log("Sending webhook request:", {
        url: webhookUrl,
        jobCount: jobsWithSource.length,
        firstJobTitle: jobsWithSource[0]?.title,
        firstJobSource: jobsWithSource[0]?.source?.name,
      });

      addToActivityLog(
        `Attempting to send ${jobsWithSource.length} job(s) to webhook...`
      );

      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobsWithSource),
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
            throw new Error(
              `HTTP error! status: ${response.status} - ${response.statusText}`
            );
          }
          addOperationBreadcrumb("Webhook request successful", {
            status: response.status,
          });
          return response.text();
        })
        .then((result) => {
          console.log("Webhook response:", result);
          addToActivityLog(
            `Webhook sent successfully for ${jobsWithSource.length} job(s)`
          );
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
              jobCount: jobsWithSource.length,
              firstJobTitle: jobsWithSource[0]?.title,
              firstJobSource: jobsWithSource[0]?.source?.name,
            },
            "error"
          );
          console.error("Webhook request failed:", error);
          addToActivityLog(`Error sending webhook: ${error.message}`);
          logAndReportError("Error sending webhook", error, {
            webhookUrl,
            jobCount: jobsWithSource.length,
            firstJobTitle: jobsWithSource[0]?.title,
            firstJobSource: jobsWithSource[0]?.source?.name,
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
          jobCount: jobs?.length,
        },
        "error"
      );
      console.error("Error in sendToWebhook:", error);
      logAndReportError("Error in sendToWebhook", error, {
        webhookUrl,
        jobCount: jobs?.length,
      });
      addToActivityLog(`Error in sendToWebhook: ${error.message}`);
      reject(error);
      endOperation();
    }
  });
}

// Export functions using globalThis
globalThis.sendToWebhook = sendToWebhook;
