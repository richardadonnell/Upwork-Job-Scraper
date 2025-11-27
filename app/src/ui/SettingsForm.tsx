import React, { useEffect, useState } from 'react'
import Input from './components/Input'
import Button from './components/Button'
import { getSettings, setSettings, ExtensionSettings } from '../shared/storage'

export default function SettingsForm() {
  const [settings, setLocalSettings] = useState<ExtensionSettings>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then((s) => setLocalSettings(s))
  }, [])

  const save = async () => {
    setSaving(true)
    await setSettings(settings)
    setSaving(false)
    alert('Saved')
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Search URL</label>
        <Input value={settings.searchUrl || ''} onChange={(e) => setLocalSettings({ ...settings, searchUrl: e.target.value })} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Webhook URL</label>
        <Input value={settings.webhookUrl || ''} onChange={(e) => setLocalSettings({ ...settings, webhookUrl: e.target.value })} />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </Button>
        <Button onClick={() => window.location.reload()} className="bg-gray-200 text-black">
          Reload
        </Button>
      </div>
    </div>
  )
}
