import "@radix-ui/themes/styles.css";
import "./index.css";

import { Theme } from "@radix-ui/themes";
import React from "react";
import ReactDOM from "react-dom/client";
import { OptionsApp } from "../../components/OptionsApp";
import { captureContextException, initSentryContext } from "../../utils/sentry";

initSentryContext("options");

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("[Upwork Scraper] Options root element not found");
}

const root = ReactDOM.createRoot(rootElement, {
	onUncaughtError: (error, errorInfo) => {
		captureContextException("options", error, {
			errorType: "uncaught",
			componentStack: errorInfo.componentStack,
		});
	},
	onCaughtError: (error, errorInfo) => {
		captureContextException("options", error, {
			errorType: "caught",
			componentStack: errorInfo.componentStack,
		});
	},
	onRecoverableError: (error) => {
		captureContextException("options", error, {
			errorType: "recoverable",
		});
	},
});

root.render(
	<React.StrictMode>
		<Theme
			appearance="dark"
			accentColor="grass"
			grayColor="olive"
			radius="small"
		>
			<OptionsApp />
		</Theme>
	</React.StrictMode>,
);
