/**
 * NICDA config — version, FX, delivery stages, sector meta
 * Updated: 3 Nov 2026
 */
(function (w) {
  "use strict";
  w.NICDA = w.NICDA || {};
  w.NICDA.VERSION = "1.4.0";
  w.NICDA.RELEASE_DATE = "2026-11-03";
  w.NICDA.FX_NGN_PER_USD = 1347; // CBN indicative 3 Nov 2026
  w.NICDA.FX_AS_OF = "3 Nov 2026";
  w.NICDA.PIPELINE_TOTAL_USD_BN = 78.5;
  w.NICDA.displayCurrency = "USD";

  w.NICDA.DELIVERY_STAGES = [
    { id: "yet_to_start", label: "Yet to start", anno: "Pre-initiation · concept", width: "100%", color: "#71717a" },
    { id: "initiation", label: "Initiation", anno: "Sponsor · portal listing", width: "90%", color: "#1d4ed8" },
    { id: "bankability", label: "Bankability", anno: "IRR/DSCR · permits pack", width: "78%", color: "#b45309" },
    { id: "engagement", label: "Engagement", anno: "LOI · site · term sheet", width: "64%", color: "#6d28d9" },
    { id: "construction", label: "Construction", anno: "Implementation underway", width: "50%", color: "#c2410c" },
    { id: "completion", label: "Completion", anno: "COD · operational", width: "40%", color: "#047857" }
  ];

  w.NICDA.SECTOR_COLORS = {
    "Oil, Gas & Power": "#b45309",
    "Transport & Maritime": "#1d4ed8",
    "Agriculture & Agro-Processing": "#047857",
    "Industry, Manufacturing & Mining": "#7c3aed",
    "Technology, Health & Urban": "#be123c"
  };

  w.NICDA.SECTOR_IMAGES = {
    "Oil, Gas & Power": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    "Transport & Maritime": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&q=80",
    "Agriculture & Agro-Processing": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    "Industry, Manufacturing & Mining": "https://images.unsplash.com/photo-1565793298595-6a99b0c5833f?w=800&q=80",
    "Technology, Health & Urban": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
  };

  w.NICDA.sectorsMeta = [
    { name: "Oil, Gas & Power", capital: 36.4, count: 25, color: "#b45309", pct: 46.4 },
    { name: "Transport & Maritime", capital: 25.0, count: 8, color: "#1d4ed8", pct: 31.8 },
    { name: "Agriculture & Agro-Processing", capital: 9.8, count: 6, color: "#047857", pct: 12.5 },
    { name: "Industry, Manufacturing & Mining", capital: 6.6, count: 17, color: "#7c3aed", pct: 8.4 },
    { name: "Tech, Health & Urban", capital: 0.7, count: 9, color: "#be123c", pct: 0.9 }
  ];
})(window);
