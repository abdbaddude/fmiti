(function () {
  "use strict";
  var projects = [];
  var map = null;
  var markersLayer = null;
  var mapReady = false;
  var selectedId = null;
  var activeFunnelStage = null;

  var DELIVERY_STAGES = [
    { id: "yet_to_start", label: "Yet to start", anno: "Pre-initiation · concept", width: "100%", color: "#71717a" },
    { id: "initiation", label: "Initiation", anno: "Sponsor · portal listing", width: "90%", color: "#1d4ed8" },
    { id: "bankability", label: "Bankability", anno: "IRR/DSCR · permits pack", width: "78%", color: "#b45309" },
    { id: "engagement", label: "Engagement", anno: "LOI · site · term sheet", width: "66%", color: "#6d28d9" },
    { id: "construction", label: "Construction", anno: "Implementation underway", width: "52%", color: "#c2410c" },
    { id: "completion", label: "Completion", anno: "COD · operational", width: "40%", color: "#047857" }
  ];

  var SECTOR_COLORS = {
    "Oil, Gas & Power": "#b45309",
    "Transport & Maritime": "#1d4ed8",
    "Agriculture & Agro-Processing": "#047857",
    "Industry, Manufacturing & Mining": "#7c3aed",
    "Technology, Health & Urban": "#be123c"
  };

  var SECTOR_IMAGES = {
    "Oil, Gas & Power": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    "Transport & Maritime": "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&q=80",
    "Agriculture & Agro-Processing": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    "Industry, Manufacturing & Mining": "https://images.unsplash.com/photo-1565793298595-6a99b0c5833f?w=800&q=80",
    "Technology, Health & Urban": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
  };

  var sectorsMeta = [
    { name: "Oil, Gas & Power", capital: 36.4, count: 25, color: "#b45309", pct: 46.4 },
    { name: "Transport & Maritime", capital: 25.0, count: 8, color: "#1d4ed8", pct: 31.8 },
    { name: "Agriculture & Agro-Processing", capital: 9.8, count: 6, color: "#047857", pct: 12.5 },
    { name: "Industry, Manufacturing & Mining", capital: 6.6, count: 17, color: "#7c3aed", pct: 8.4 },
    { name: "Tech, Health & Urban", capital: 0.7, count: 9, color: "#be123c", pct: 0.9 }
  ];

  function formatCapital(c) {
    if (c == null || isNaN(c)) return "—";
    if (c >= 1000) return "$" + (c / 1000).toFixed(2) + " bn";
    return "$" + Number(c).toFixed(c % 1 ? 1 : 0) + " m";
  }
  function bankBadge(b) {
    var map = { High: "badge-high", "Medium-High": "badge-mh", Medium: "badge-med", "Medium-Low": "badge-ml", "Low-Medium": "badge-low" };
    return '<span class="badge ' + (map[b] || "badge-med") + '">' + (b || "—") + "</span>";
  }
  function stageBadge(p) {
    return '<span class="badge stage-' + (p.deliveryStage || "initiation") + '">' + (p.deliveryStageLabel || p.deliveryStage || "—") + "</span>";
  }
  function probBar(p) {
    var pct = Math.round((p || 0) * 100);
    var color = pct >= 45 ? "#047857" : pct >= 35 ? "#1d4ed8" : pct >= 28 ? "#b45309" : "#be123c";
    return '<div class="flex items-center gap-2 min-w-[80px]"><div class="prob-bar flex-1"><div class="prob-fill" style="width:' + pct + '%;background:' + color + '"></div></div><span class="text-[11px] font-mono text-bronze-700 w-8">' + pct + "%</span></div>";
  }
  function stageIndex(p) {
    var m = { yet_to_start: 0, initiation: 1, bankability: 2, engagement: 3, construction: 4, completion: 5 };
    return m[p.deliveryStage] != null ? m[p.deliveryStage] : 1;
  }
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, """);
  }

  function switchTab(name) {
    var tabs = document.querySelectorAll(".tab-btn");
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle("active", tabs[i].getAttribute("data-tab") === name);
    document.getElementById("panel-nigeria").classList.toggle("hidden-tab", name !== "nigeria");
    document.getElementById("panel-conversion").classList.toggle("hidden-tab", name !== "conversion");
    if (name === "conversion") {
      if (!mapReady) { initMap(); mapReady = true; }
      setTimeout(function () { if (map) { map.invalidateSize(); renderMapMarkers(getFiltered()); } }, 120);
    }
  }

  function bindTabs() {
    var tabs = document.querySelectorAll(".tab-btn");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", function (e) { switchTab(e.currentTarget.getAttribute("data-tab")); });
    }
  }

  function renderSectorBars() {
    var el = document.getElementById("sectorBars");
    if (!el) return;
    el.innerHTML = sectorsMeta.map(function (s) {
      return '<div><div class="flex justify-between text-xs mb-1"><span class="text-bronze-700 font-medium">' + s.name + '</span><span class="text-bronze-400">$' + s.capital + ' bn · ' + s.count + '</span></div><div class="h-2 bg-cream-200 rounded-full overflow-hidden"><div class="h-full rounded-full" style="width:' + s.pct + '%;background:' + s.color + '"></div></div></div>';
    }).join("");
  }

  function stageCounts() {
    var c = {};
    for (var i = 0; i < DELIVERY_STAGES.length; i++) c[DELIVERY_STAGES[i].id] = 0;
    for (var j = 0; j < projects.length; j++) { if (c[projects[j].deliveryStage] != null) c[projects[j].deliveryStage]++; }
    return c;
  }

  function renderFunnels() {
    var c = stageCounts();
    var html = DELIVERY_STAGES.map(function (s) {
      return '<button type="button" class="funnel-stage' + (activeFunnelStage === s.id ? ' active-stage' : '') + '" style="width:' + s.width + ';background:' + s.color + '" data-stage="' + s.id + '"><div class="fs-label"><span>' + s.label + '</span><span class="fs-anno">' + s.anno + '</span></div><span class="fs-count">' + (c[s.id] || 0) + '</span></button>';
    }).join("");
    var n = document.getElementById("funnelNigeria");
    var cv = document.getElementById("funnelConversion");
    if (n) n.innerHTML = html;
    if (cv) cv.innerHTML = html;
    var kc = document.getElementById("kpiComplete"); if (kc) kc.textContent = String(c.completion || 0);
    var kb = document.getElementById("kpiBuild"); if (kb) kb.textContent = String(c.construction || 0);
    var ky = document.getElementById("kpiYet"); if (ky) ky.textContent = String(c.yet_to_start || 0);
    function attach(container) {
      if (!container) return;
      var btns = container.querySelectorAll(".funnel-stage");
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function (e) { onFunnelClick(e.currentTarget.getAttribute("data-stage")); });
      }
    }
    attach(n); attach(cv);
  }

  function onFunnelClick(id) {
    activeFunnelStage = activeFunnelStage === id ? null : id;
    var s = null;
    for (var i = 0; i < DELIVERY_STAGES.length; i++) if (DELIVERY_STAGES[i].id === id) s = DELIVERY_STAGES[i];
    var note = document.getElementById("funnelStageNote");
    if (note) note.textContent = (activeFunnelStage && s) ? (s.label + ": " + s.anno) : "Map shows all planned projects by default.";
    renderFunnels();
    refreshConversion();
  }

  function bindRowClicks(tbody) {
    var rows = tbody.querySelectorAll("tr[data-id]");
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener("click", function (e) {
        var id = parseInt(e.currentTarget.getAttribute("data-id"), 10);
        switchTab("conversion");
        setTimeout(function () { openProfile(id); }, 80);
      });
    }
  }

  function renderShortlist() {
    var p1 = projects.filter(function (p) { return p.priority === 1; }).slice(0, 16);
    var el = document.getElementById("shortlist");
    if (!el) return;
    el.innerHTML = p1.map(function (p) {
      var prog = p.deliveryProgress != null ? p.deliveryProgress : 0;
      return '<tr class="cursor-pointer" data-id="' + p.id + '"><td class="px-3 py-2.5"><div class="font-medium text-bronze-800">' + escapeHtml(p.name) + '</div><div class="text-[10px] text-bronze-400">' + formatCapital(p.capitalUSDm) + '</div></td><td class="px-3 py-2.5 text-sm">' + escapeHtml(p.state || "—") + '</td><td class="px-3 py-2.5">' + stageBadge(p) + '</td><td class="px-3 py-2.5"><div class="flex items-center gap-2"><div class="prob-bar flex-1 min-w-[60px]"><div class="prob-fill" style="width:' + prog + '%;background:#5c4a32"></div></div><span class="text-[11px] font-mono">' + prog + '%</span></div></td><td class="px-3 py-2.5 text-[11px] text-bronze-500">' + escapeHtml((p.fundingSources || []).slice(0, 2).join(" · ")) + '</td></tr>';
    }).join("");
    bindRowClicks(el);
  }

  function renderPipelineNigeria(filter) {
    filter = filter || "all";
    var list = filter === "all" ? projects : projects.filter(function (p) { return p.sector === filter; });
    var el = document.getElementById("pipelineNigeria");
    if (!el) return;
    el.innerHTML = list.map(function (p) {
      return '<tr class="cursor-pointer" data-id="' + p.id + '"><td class="px-3 py-2 text-bronze-400 text-xs">' + p.id + '</td><td class="px-3 py-2"><div class="font-medium">' + escapeHtml(p.name) + '</div></td><td class="px-3 py-2 text-sm">' + escapeHtml(p.state || "—") + '</td><td class="px-3 py-2">' + stageBadge(p) + '</td><td class="px-3 py-2 text-right font-mono whitespace-nowrap">' + formatCapital(p.capitalUSDm) + '</td><td class="px-3 py-2 text-[11px] text-bronze-500">' + escapeHtml((p.fundingSources || []).join(" · ")) + '</td></tr>';
    }).join("");
    bindRowClicks(el);
  }

  function getFiltered() {
    var q = ((document.getElementById("ciSearch") || {}).value || "").toLowerCase().trim();
    var sector = (document.getElementById("ciSector") || {}).value || "all";
    var stage = (document.getElementById("ciStage") || {}).value || "all";
    var priority = (document.getElementById("ciPriority") || {}).value || "all";
    return projects.filter(function (p) {
      if (sector !== "all" && p.sector !== sector) return false;
      if (stage !== "all" && p.deliveryStage !== stage) return false;
      if (priority !== "all" && String(p.priority) !== priority) return false;
      if (activeFunnelStage && p.deliveryStage !== activeFunnelStage) return false;
      if (q) {
        var hay = [p.name, p.location, p.state, p.sector, p.sponsorHint, (p.fundingSources || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderCiTable(list) {
    var countEl = document.getElementById("ciResultCount");
    if (countEl) countEl.textContent = list.length + " of " + projects.length + " projects";
    var el = document.getElementById("ciTable");
    if (!el) return;
    if (!list.length) { el.innerHTML = '<tr><td colspan="2" class="px-3 py-6 text-center text-bronze-400 text-sm">No match</td></tr>'; return; }
    el.innerHTML = list.map(function (p) {
      return '<tr class="cursor-pointer' + (selectedId === p.id ? ' selected' : '') + '" data-id="' + p.id + '"><td class="px-3 py-2"><div class="font-medium text-bronze-800 text-xs">' + escapeHtml(p.name) + '</div><div class="text-[10px] text-bronze-400">' + escapeHtml(p.state || '') + ' · ' + formatCapital(p.capitalUSDm) + '</div></td><td class="px-3 py-2">' + stageBadge(p) + '</td></tr>';
    }).join("");
    var rows = el.querySelectorAll("tr[data-id]");
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener("click", function (e) { openProfile(parseInt(e.currentTarget.getAttribute("data-id"), 10)); });
    }
  }

  function refreshConversion() {
    var list = getFiltered();
    renderCiTable(list);
    if (mapReady) renderMapMarkers(list);
  }

  function bindFilters() {
    ["ciSearch", "ciSector", "ciStage", "ciPriority"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", refreshConversion);
      el.addEventListener("change", refreshConversion);
    });
    var reset = document.getElementById("ciReset");
    if (reset) {
      reset.addEventListener("click", function () {
        document.getElementById("ciSearch").value = "";
        document.getElementById("ciSector").value = "all";
        document.getElementById("ciStage").value = "all";
        document.getElementById("ciPriority").value = "all";
        activeFunnelStage = null;
        renderFunnels();
        var note = document.getElementById("funnelStageNote");
        if (note) note.textContent = "Map shows all planned projects by default.";
        refreshConversion();
      });
    }
    var sf = document.getElementById("sectorFilterNigeria");
    if (sf) sf.addEventListener("change", function (e) { renderPipelineNigeria(e.target.value); });
  }

  function openProfile(id) {
    var p = null;
    for (var i = 0; i < projects.length; i++) if (projects[i].id === id) { p = projects[i]; break; }
    if (!p) return;
    selectedId = id;
    document.getElementById("profileEmpty").classList.add("hidden");
    document.getElementById("profileContent").classList.remove("hidden");
    var img = SECTOR_IMAGES[p.sector] || SECTOR_IMAGES["Industry, Manufacturing & Mining"];
    document.getElementById("profileHero").style.backgroundImage = "url('" + img + "')";
    document.getElementById("profileSectorTag").textContent = p.sector || "";
    document.getElementById("profileName").textContent = p.name || "";
    document.getElementById("profileLocation").textContent = (p.location || "") + (p.state ? " · " + p.state + " State" : "");
    document.getElementById("profileCapital").textContent = formatCapital(p.capitalUSDm);
    document.getElementById("profileState").textContent = p.state || "—";
    document.getElementById("profileBank").innerHTML = bankBadge(p.bankability);
    document.getElementById("profileProb").innerHTML = probBar(p.conversionProbability);
    document.getElementById("profileFinance").textContent = "Model: " + (p.financingModel || "—");
    document.getElementById("profileSponsor").textContent = "Sponsor: " + (p.sponsorHint || "—");
    document.getElementById("profileFunding").innerHTML = (p.fundingSources || []).map(function (f) { return "<li>· " + escapeHtml(f) + "</li>"; }).join("") || "<li>—</li>";
    document.getElementById("profileBottlenecks").innerHTML = (p.bottlenecks || []).map(function (b) { return "<li>· " + escapeHtml(b) + "</li>"; }).join("") || "<li>—</li>";
    document.getElementById("profileNext").textContent = p.nextAction || "—";
    var prog = p.deliveryProgress != null ? p.deliveryProgress : 0;
    document.getElementById("profileProgressPct").textContent = prog + "%";
    document.getElementById("profileProgressBar").style.width = prog + "%";
    var si = stageIndex(p);
    document.getElementById("profileStageLabel").textContent = "Current: " + (p.deliveryStageLabel || "");
    document.getElementById("profilePipeline").innerHTML = DELIVERY_STAGES.map(function (s, i) {
      var cls = i < si ? "done" : i === si ? "current" : "";
      return '<div class="pipe-step ' + cls + '"><div class="pipe-dot">' + (i + 1) + '</div><div class="pipe-name">' + s.label + '</div></div>';
    }).join("");
    document.getElementById("profileTimeline").innerHTML = (p.timeline || []).map(function (t) {
      return '<div class="flex gap-3 text-sm"><span class="font-mono text-xs text-bronze-600 min-w-[64px] pt-0.5">' + escapeHtml(t.date) + '</span><span class="text-bronze-800">' + escapeHtml(t.event) + '</span></div>';
    }).join("") || '<p class="text-sm text-bronze-500">—</p>';
    renderCiTable(getFiltered());
  }

  function sectorIcon(sector, priority, stateName) {
    var color = SECTOR_COLORS[sector] || "#8b7355";
    var size = priority === 1 ? 14 : 11;
    var label = (stateName || "").replace(/&/g, "&").replace(/</g, "").substring(0, 10);
    var svg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="72" height="28"><circle cx="10" cy="14" r="' + (size / 2) + '" fill="' + color + '" stroke="#fff" stroke-width="2"/><rect x="20" y="6" width="50" height="16" rx="3" fill="rgba(255,255,255,0.95)" stroke="#e2d6c4"/><text x="24" y="17" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="9" font-weight="700" fill="#5c4a32">' + label + '</text></svg>');
    return L.icon({ iconUrl: "data:image/svg+xml," + svg, iconSize: [72, 28], iconAnchor: [10, 14], popupAnchor: [0, -12] });
  }

  function initMap() {
    if (typeof L === "undefined") return;
    map = L.map("map", { center: [9.1, 8.0], zoom: 6, minZoom: 5, maxZoom: 12 });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles © Esri · BSM demo", maxZoom: 16 }).addTo(map);
    map.setMaxBounds([[2.5, 1.5], [14.5, 15.5]]);
    markersLayer = L.layerGroup().addTo(map);
    var legend = document.getElementById("mapLegend");
    if (legend) {
      legend.innerHTML = Object.keys(SECTOR_COLORS).map(function (n) {
        return '<span class="inline-flex items-center gap-1"><span style="width:8px;height:8px;border-radius:50%;background:' + SECTOR_COLORS[n] + '"></span>' + n.split(" & ")[0] + '</span>';
      }).join("");
    }
  }

  function renderMapMarkers(list) {
    if (!markersLayer) return;
    markersLayer.clearLayers();
    var jitter = {};
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (p.lat == null || p.lng == null) continue;
      var key = p.lat.toFixed(2) + "," + p.lng.toFixed(2);
      jitter[key] = (jitter[key] || 0) + 1;
      var j = jitter[key] - 1;
      (function (proj) {
        var marker = L.marker([proj.lat + (j % 3) * 0.05, proj.lng + Math.floor(j / 3) * 0.06], {
          icon: sectorIcon(proj.sector, proj.priority, proj.state),
          title: proj.name + " · " + (proj.state || "")
        });
        marker.on("click", function () { openProfile(proj.id); });
        marker.bindTooltip(proj.name + " · " + (proj.deliveryStageLabel || ""), { direction: "top", offset: [0, -10] });
        markersLayer.addLayer(marker);
      })(p);
    }
  }

  function showError(msg) {
    var el = document.getElementById("loadError");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function load() {
    bindTabs();
    bindFilters();
    var closeBtn = document.getElementById("profileClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        selectedId = null;
        document.getElementById("profileContent").classList.add("hidden");
        document.getElementById("profileEmpty").classList.remove("hidden");
        renderCiTable(getFiltered());
      });
    }
    function renderAll() {
      renderSectorBars();
      renderFunnels();
      renderShortlist();
      renderPipelineNigeria("all");
      renderCiTable(projects);
    }
    function loadParts() {
      return Promise.all([
        fetch("projects-part0.json").then(function (r) { return r.ok ? r.json() : { projects: [] }; }).catch(function () { return { projects: [] }; }),
        fetch("projects-part1.json").then(function (r) { return r.ok ? r.json() : { projects: [] }; }).catch(function () { return { projects: [] }; }),
        fetch("projects-part2.json").then(function (r) { return r.ok ? r.json() : { projects: [] }; }).catch(function () { return { projects: [] }; })
      ]).then(function (parts) {
        var merged = [];
        for (var i = 0; i < parts.length; i++) {
          var arr = (parts[i] && parts[i].projects) ? parts[i].projects : [];
          for (var j = 0; j < arr.length; j++) merged.push(arr[j]);
        }
        return merged;
      });
    }
    loadParts().then(function (merged) {
      if (merged && merged.length >= 20) {
        projects = merged;
        renderAll();
        return;
      }
      return fetch("projects.json").then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      }).then(function (data) {
        projects = data.projects || data || [];
        if (!projects.length) throw new Error("No projects in data");
        renderAll();
      });
    }).catch(function (err) {
      console.error(err);
      showError("Failed to load projects — " + (err && err.message ? err.message : String(err)));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load);
  else load();
})();
