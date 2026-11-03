# Nigeria National Investment Conversion & Delivery Assurance (NICDA™)

**v1.3.1** — self-contained SPA (single `index.html`)

Beth Schwarz & Myers · FMITI / NIPC pilot demo

## Run locally
```bash
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

Or open `index.html` directly in a browser (CDN scripts still load for Tailwind + Leaflet).

## Features
- 65-project pipeline ($78.5bn simulated)
- Unified searchable / priority-filtered / paginated table
- Visual delivery funnel + Nigeria map (state labels)
- Conversion intelligence profiles
- Network signal (projects · states · funders · FMITI) + optional Venn
- Currency switcher USD / NGN (CBN 1 USD = 1,347 NGN, 3 Nov 2026)
- About + Contact (NICDA™ · BSM · Adebiyi Abdurrahman)
- Professional icons, Helvetica Neue, white BSM theme

## Branch strategy
- `main` — production (Netlify production if credits available)
- `v1.x.x` — preview / feature branches

Demo data only — not official FMITI data.
