# Nigeria National Investment Conversion & Delivery Assurance

**Beth Schwarz & Myers** · **v1.1.0**

Self-contained SPA (demo). 65 simulated projects. Not official FMITI data.

## Run
```bash
cd fmiti-investment-dashboard
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

## Files
- `index.html` — UI shell + professional icons
- `data.js` — 65 embedded projects (stages, funding, lat/lng)
- `app.js` — tabs, delivery funnel, map, intelligence profiles
- `manifest.json` / `sw.js` — PWA

## Features
- Pipeline overview + Conversion & delivery tabs (with icons)
- Visual delivery funnel (click stage to filter)
- Nigeria map with state name markers (all 65 by default)
- Bankability, bottlenecks, funding sources, next actions
- Helvetica Neue · white theme · BSM branding · demo banner
