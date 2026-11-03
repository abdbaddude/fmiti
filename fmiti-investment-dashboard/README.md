# FMITI Investment Dashboard — v1.1.1

**Nigeria National Investment Conversion & Delivery Assurance** (BSM demo)

## Changes in v1.1.1
- Unified Investment pipeline table (shortlist + full list collapsed)
- Search, sector filter, priority filter (P1–P3)
- Pagination (10 / page); delivery progress retained
- Sector and stage professional SVG icons
- Currency switcher: **USD** (default) / **NGN** with demo rate **1 USD = 1,600 NGN**
- BSM crest branding, white theme, Helvetica Neue

## Run locally
```bash
cd fmiti-investment-dashboard
python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

Prefer self-contained `index.html` (embeds 65 simulated projects). Legacy `data-a.js` + `data-b.js` + `app.js` remain for thin deploys.

**Demo only** — not official FMITI data.
