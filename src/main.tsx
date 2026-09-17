import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './Root'
import { LanguageProvider } from './i18n'
import './styles.css'
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><LanguageProvider><Root /></LanguageProvider></React.StrictMode>)
