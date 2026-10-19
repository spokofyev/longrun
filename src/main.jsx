import { StrictMode, useEffect, useState } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'
import content from './content.json'

const root = document.getElementById('root')

// /?preview is loaded inside /admin, which posts the draft content here.
function Preview() {
  const [draft, setDraft] = useState(content)
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin === window.location.origin && e.data?.type === 'cms-preview') setDraft(e.data.content)
    }
    window.addEventListener('message', onMessage)
    window.parent.postMessage({ type: 'cms-ready' }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [])
  return <App content={draft} />
}

const isPreview = new URLSearchParams(window.location.search).has('preview') && window.parent !== window
const app = <StrictMode>{isPreview ? <Preview /> : <App content={content} />}</StrictMode>

// The page is prerendered at build time; hydrate it when the markup is there.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
