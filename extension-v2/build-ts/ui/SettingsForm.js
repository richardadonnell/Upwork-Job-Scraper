import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Input from './components/Input';
import Button from './components/Button';
import { getSettings, setSettings } from '../shared/storage';
export default function SettingsForm() {
    const [settings, setLocalSettings] = useState({});
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        getSettings().then((s) => setLocalSettings(s));
    }, []);
    const save = async () => {
        setSaving(true);
        await setSettings(settings);
        setSaving(false);
        alert('Saved');
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Search URL" }), _jsx(Input, { value: settings.searchUrl || '', onChange: (e) => setLocalSettings({ ...settings, searchUrl: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Webhook URL" }), _jsx(Input, { value: settings.webhookUrl || '', onChange: (e) => setLocalSettings({ ...settings, webhookUrl: e.target.value }) })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { onClick: save, disabled: saving, children: saving ? 'Saving...' : 'Save settings' }), _jsx(Button, { onClick: () => window.location.reload(), className: "bg-gray-200 text-black", children: "Reload" })] })] }));
}
