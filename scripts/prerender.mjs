// Renders the page to static HTML after `vite build`, so crawlers and link
// previews see the content without running JavaScript. Also publishes
// content.json so /admin can tell when a save has gone live.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const ssrDir = resolve(root, 'dist-ssr')
const content = JSON.parse(readFileSync(resolve(root, 'src/content.json'), 'utf8'))

const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const { title, description } = content.site

const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)
const file = resolve(dist, 'index.html')
const html = readFileSync(file, 'utf8')
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(description)}"`)
  .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`)
  .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(description)}"`)
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
writeFileSync(file, html)
writeFileSync(resolve(dist, 'content.json'), JSON.stringify(content))
rmSync(ssrDir, { recursive: true, force: true })
console.log('prerendered / -> dist/index.html')
