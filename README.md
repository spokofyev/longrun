# Longrun

Landing page for Longrun: synthetic RL environments for personal agents and AI employees.

A single-page Vite + React site. The page is prerendered to static HTML at build time.

```bash
npm install
npm run dev      # local dev server
npm run build    # dist/ (static, prerendered)
```

- `src/RlEnvironments.jsx` page content and sections
- `src/App.jsx` header, sticky bar, footer and request form
- `src/Glow.jsx` animated WebGL background (CSS fallback)
- `src/index.css` styles (shared design system with spvventures.co)

The request form opens the visitor's email app addressed to `EMAIL` in `src/App.jsx`.

Deployed on Vercel (project `longrun`).
