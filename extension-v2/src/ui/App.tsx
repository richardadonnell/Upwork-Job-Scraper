import React from 'react'
import SettingsForm from './SettingsForm'

export default function App() {
  return (
    <div className="p-6 max-w-screen-md mx-auto">
      <h1 className="text-2xl font-semibold">Upwork Job Scraper — Settings (v2)</h1>
      <p className="mt-2 text-sm text-slate-600">Configure searches and webhooks here.</p>

      <div className="mt-6">
        <SettingsForm />
      </div>
    </div>
  )
}
