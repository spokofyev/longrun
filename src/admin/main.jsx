import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './admin.css'
import Admin from './Admin.jsx'

createRoot(document.getElementById('admin')).render(
  <StrictMode>
    <Admin />
  </StrictMode>,
)
