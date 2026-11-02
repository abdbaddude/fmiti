# fmiti

FMITI (Federal Ministry of Industry, Trade and Investment) – investment, trade and digital tools.

## Investment Conversion Dashboard

Live app source: **`fmiti-investment-dashboard/`** on branch **`deploy/netlify`**.

### Netlify setup (cost-aware)

| Setting | Value |
|---------|--------|
| Repository | `abdbaddude/fmiti` |
| Production branch | **`deploy/netlify`** (not `main`) |
| Base directory | `fmiti-investment-dashboard` |
| Publish directory | `fmiti-investment-dashboard` |
| Build command | (none – static) |

Pushing to `main` does **not** trigger production deploys. Only commits on `deploy/netlify` do.

### Files

- `index.html` – SPA dashboard
- `projects.json` / `projects.csv` – 65-project pipeline
- `manifest.json` + `sw.js` – PWA
- `netlify.toml` – headers / static config
