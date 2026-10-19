# Longrun

Landing page for Longrun: synthetic RL environments for personal agents and AI employees.

A Vite + React site, prerendered to static HTML at build time, with a small content admin at `/admin`.

```bash
npm install
npm run dev      # site at /, admin at /admin.html
npm run build    # dist/ (static, prerendered)
```

## Editing content

All page text, the order of sections and which sections are shown live in `src/content.json`.

Edit it at **`/admin`** on the live site:

1. Sign in with a GitHub fine-grained token: *Only select repositories* → `spokofyev/longrun`, permission *Contents: Read and write*. The token stays in your browser.
2. Edit text, drag sections to reorder, hide or show them. The preview updates as you type.
3. **Save** commits `src/content.json` to `main`. Vercel rebuilds the site, and the admin shows *Live on the site* once the new version is served (usually under a minute).

Every save is a commit, so history and undo are in Git. Editing `src/content.json` by hand works the same way.

## Code

- `src/content.json` all page content
- `src/RlEnvironments.jsx` page sections, rendered from the content
- `src/App.jsx` header, sticky bar, footer and request form
- `src/Glow.jsx` animated WebGL background (CSS fallback)
- `src/index.css` site styles (shared design system with spvventures.co)
- `src/admin/` the admin: GitHub client, field schema, editor UI

Adding a new kind of section: add a component to `SECTION_COMPONENTS` in `src/RlEnvironments.jsx`, its fields to `SECTION_TYPES` in `src/admin/schema.js`, and an entry in `content.json`.

Deployed on Vercel (project `longrun`).
