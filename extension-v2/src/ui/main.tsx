import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../styles/tailwind.css'

// make chrome available in types
declare global {
	interface Window {
		chrome?: any
	}
}

createRoot(document.getElementById('root')!).render(<App />)
