# Nigeria National Investment Conversion & Delivery Assurance

**Beth Schwarz & Myers** · **v1.0.0**

> **DEMO** — Simulated stages, dates, progress and funding. Not official FMITI data.

## Branch contents (complete deployment)

| File | Role |
|------|------|
| `index.html` | SPA shell (Helvetica Neue, white theme, demo banner) |
| `app.js` | Logic — merges `projects-part0/1/2.json` → **65 projects** |
| `projects-part0.json` | Projects 1–22 |
| `projects-part1.json` | Projects 23–44 |
| `projects-part2.json` | Projects 45–65 |
| `projects.json` | Fallback sample |
| `manifest.json` / `sw.js` | PWA |
| `netlify.toml` | Static publish |

## Run locally
```bash
cd fmiti-investment-dashboard
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

Branch: `v1.0.0` · Repo: https://github.com/abdbaddude/fmiti
