import "@radix-ui/themes/styles.css";
import "./index.css";

import { Theme } from "@radix-ui/themes";
import React from "react";
import ReactDOM from "react-dom/client";
import { OptionsApp } from "../../components/OptionsApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Theme
			appearance="dark"
			accentColor="green"
			grayColor="slate"
			radius="medium"
		>
			<OptionsApp />
		</Theme>
	</React.StrictMode>,
);
