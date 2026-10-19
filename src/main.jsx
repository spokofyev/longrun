import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The page is prerendered at build time; hydrate it when the markup is there.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
