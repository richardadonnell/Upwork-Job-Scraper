import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SettingsForm from './SettingsForm';
export default function App() {
    return (_jsxs("div", { className: "p-6 max-w-screen-md mx-auto", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Upwork Job Scraper \u2014 Settings (v2)" }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: "Configure searches and webhooks here." }), _jsx("div", { className: "mt-6", children: _jsx(SettingsForm, {}) })] }));
}
