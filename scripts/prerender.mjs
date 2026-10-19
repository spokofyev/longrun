// Renders the page to static HTML after `vite build`, so crawlers and link
// previews see the content without running JavaScript.
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const ssrDir = resolve(root, 'dist-ssr')

const { render } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)
const file = resolve(dist, 'index.html')
const html = readFileSync(file, 'utf8').replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
writeFileSync(file, html)
rmSync(ssrDir, { recursive: true, force: true })
console.log('prerendered / -> dist/index.html')
