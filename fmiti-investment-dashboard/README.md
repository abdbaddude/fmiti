# Nigeria National Investment Conversion & Delivery Assurance (NICDA™)

**v1.3.1-stable** (from v1.3.0 working tree)

Beth Schwarz & Myers · FMITI / NIPC pilot demo

## Critical: how to view

Do **not** open the GitHub blob/raw page alone. That shows only the static `$78.5bn` HTML shell because relative scripts (`./data-a.js`, `./app.js`, …) do not execute there.

### Local (recommended)
```bash
git clone -b v1.3.1-stable https://github.com/abdbaddude/fmiti.git
cd fmiti/fmiti-investment-dashboard
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

### Files
- `index.html` — shell + tabs
- `data-a.js` / `data-b.js` — 65 projects (`window.EMBEDDED_PROJECTS`)
- `app.js` — KPIs, funnel, table, map, profiles, FX (CBN 1,347)
- `app-network.js` — Network signal + Venn

## Features
- 65-project pipeline ($78.5bn simulated)
- Unified searchable / priority-filtered / paginated table
- Visual delivery funnel + Nigeria map
- Conversion intelligence profiles
- Network signal (projects · states · funders · FMITI)
- Currency USD/NGN (CBN 3 Nov 2026)
- About + Contact (NICDA™ · BSM)

Demo data only — not official FMITI data.
