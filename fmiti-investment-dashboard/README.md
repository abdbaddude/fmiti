# Nigeria National Investment Conversion & Delivery Assurance (NICDA™)

**v1.4.0** — modular SPA (3 Nov 2026)

Beth Schwarz & Myers · FMITI / NIPC pilot demo

## Run locally
```bash
git clone -b v1.4.0 https://github.com/abdbaddude/fmiti.git
cd fmiti/fmiti-investment-dashboard
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

Do **not** open the GitHub blob page alone — relative scripts will not run; you will only see the static $78.5bn shell.

## Structure
| Path | Role |
|------|------|
| `index.html` | Shell, styles, tabs |
| `js/config.js` | Version, CBN FX (1,347 · 3 Nov 2026), stages, sector meta |
| `js/icons.js` | Sector / stage / network glyphs |
| `js/state-intel.js` | State card (Governor; FAAC/IGR N/A; pipeline appetite) |
| `data-a.js` / `data-b.js` | 65 projects |
| `app.js` | KPIs, funnel, table, map, profile, currency, state card |
| `app-network.js` | Draggable network nodes, icons, selection detail |

## v1.4.0 highlights
- Modular layout for maintenance and plugins
- Network: drag nodes, click for detail, type/sector icons
- Currency (USD/NGN) refreshes all tabs including network KPIs
- Map hover: capital, stage, bankability, priority
- State links → short card (Governor, FAAC N/A, IGR N/A, project appetite from this pipeline)
- Profile: small state thumb without changing the state cell

Demo data only — not official FMITI data.
