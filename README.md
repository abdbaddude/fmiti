# fmiti v1.0.0

FMITI (Federal Ministry of Industry, Trade and Investment) – investment, trade and digital tools.

## Investment Conversion Dashboard

Source: **`fmiti-investment-dashboard/`**

### Netlify branch model (cost-aware)

| Branch | Role |
|--------|------|
| **`main`** | **Production** (this is the billable / production deploy) |
| `deploy/netlify` and other branches | **Deploy Previews only** |

Netlify settings:

| Setting | Value |
|---------|--------|
| Repository | `abdbaddude/fmiti` |
| Production branch | **`main`** |
| Base directory | `fmiti-investment-dashboard` |
| Publish directory | `fmiti-investment-dashboard` |
| Build command | (none – static) |
| Branch deploys / Deploy Previews | enabled for non-`main` branches |

Work and iterate on feature branches or `deploy/netlify`; merge to **`main`** only when you want a production publish.

### App files

- `index.html` – SPA dashboard
- `projects.json` / `projects.csv` – 65-project pipeline
- `manifest.json` + `sw.js` – PWA
- `netlify.toml` – static headers
