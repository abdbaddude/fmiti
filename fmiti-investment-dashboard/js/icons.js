/**
 * Sector / stage / node icons — single source for tables, map, network
 * Updated: 3 Nov 2026
 */
(function (w) {
  "use strict";
  w.NICDA = w.NICDA || {};

  function sectorIconSvg(sector) {
    var s = sector || "";
    if (s.indexOf("Oil") === 0)
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="1.8"><path d="M12 3c-2 4-6 6-6 11a6 6 0 0012 0c0-5-4-7-6-11z"/><path d="M10 16h4"/></svg>';
    if (s.indexOf("Transport") === 0)
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="1.8"><path d="M3 17h18v2H3z"/><path d="M5 17V9l7-4 7 4v8"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></svg>';
    if (s.indexOf("Agriculture") === 0)
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="1.8"><path d="M12 22V10"/><path d="M7 12c0-4 5-8 5-8s5 4 5 8"/><path d="M5 18c3-1 7-1 10 0"/></svg>';
    if (s.indexOf("Industry") === 0)
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.8"><path d="M3 21h18"/><path d="M5 21V10l5 3V8l5 3V5l4 2v14"/></svg>';
    return '<svg class="inline-block align-middle mr-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#be123c" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>';
  }

  function stageIconSvg(stage) {
    var st = stage || "initiation";
    if (st === "completion")
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>';
    if (st === "construction")
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 6l6 6-6 6"/><path d="M4 12h16"/></svg>';
    if (st === "engagement")
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>';
    if (st === "bankability")
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>';
    if (st === "yet_to_start")
      return '<svg class="inline-block align-middle mr-1 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2 2"/></svg>';
    return '<svg class="inline-block align-middle mr-1 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 12v4"/></svg>';
  }

  function nodeGlyph(type, sector, r) {
    var s = Math.max(6, r * 0.9);
    if (type === "inst")
      return '<path d="M' + (-s * 0.4) + ',' + (s * 0.35) + ' h' + s * 0.8 + ' v' + (-s * 0.7) + ' h' + (-s * 0.25) + ' v' + (-s * 0.25) + ' h' + (-s * 0.3) + ' v' + s * 0.25 + ' z" fill="#fff" opacity="0.95"/>';
    if (type === "state")
      return '<path d="M0,' + (-s * 0.45) + ' L' + s * 0.4 + ',' + s * 0.35 + ' H' + (-s * 0.4) + ' Z" fill="#fff" opacity="0.9"/>';
    if (type === "funder")
      return '<rect x="' + (-s * 0.35) + '" y="' + (-s * 0.3) + '" width="' + s * 0.7 + '" height="' + s * 0.6 + '" rx="1.5" fill="#fff" opacity="0.9"/>';
    return '<path d="M0,' + (-s * 0.4) + ' L' + s * 0.4 + ',0 L0,' + s * 0.4 + ' L' + (-s * 0.4) + ',0 Z" fill="#fff" opacity="0.85"/>';
  }

  w.NICDA.sectorIconSvg = sectorIconSvg;
  w.NICDA.stageIconSvg = stageIconSvg;
  w.NICDA.nodeGlyph = nodeGlyph;
  w.sectorIconSvg = sectorIconSvg;
  w.stageIconSvg = stageIconSvg;
})(window);
