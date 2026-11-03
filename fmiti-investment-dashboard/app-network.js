(function () {
  "use strict";
  var netLayout = "network";
  var netSelected = null;

  function getNetworkFiltered() {
    var q = ((document.getElementById("netSearch") || {}).value || "").toLowerCase().trim();
    var sector = (document.getElementById("netSector") || {}).value || "all";
    var priority = (document.getElementById("netPriority") || {}).value || "all";
    return (window.PROJECTS || []).filter(function (p) {
      if (sector !== "all" && p.sector !== sector) return false;
      if (priority !== "all" && String(p.priority) !== priority) return false;
      if (q) {
        var hay = [p.name, p.location, p.state, p.sector, p.sponsorHint, (p.fundingSources || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function normalizeFunder(f) {
    var t = String(f || "").trim();
    if (!t) return "Unspecified";
    if (/world bank|afdb|dfi|ifc/i.test(t)) return "DFIs";
    if (/green|climate/i.test(t)) return "Green / climate";
    if (/ppp|concession/i.test(t)) return "PPP / concession";
    if (/federal|budget|fgn|mofi/i.test(t)) return "Federal budget";
    if (/state/i.test(t)) return "State counterpart";
    if (/commercial|bank/i.test(t)) return "Commercial banks";
    if (/nsia|equity/i.test(t)) return "NSIA / equity";
    if (/blended/i.test(t)) return "Blended finance";
    return t.length > 28 ? t.slice(0, 26) + "…" : t;
  }

  function buildNetworkGraph(list) {
    var nodes = {};
    var edges = [];
    nodes["inst:FMITI"] = { id: "inst:FMITI", type: "inst", label: "FMITI", capital: 0, count: 0 };
    list.forEach(function (p) {
      var pid = "p:" + p.id;
      nodes[pid] = { id: pid, type: "project", label: p.name, sector: p.sector, priority: p.priority, capital: p.capitalUSDm || 0, stage: p.deliveryStage, bankability: p.bankability, ref: p };
      edges.push({ from: pid, to: "inst:FMITI", kind: "policy" });
      nodes["inst:FMITI"].count++;
      nodes["inst:FMITI"].capital += (p.capitalUSDm || 0);
      if (p.state) {
        var sid = "s:" + p.state;
        if (!nodes[sid]) nodes[sid] = { id: sid, type: "state", label: p.state, capital: 0, count: 0 };
        nodes[sid].count++;
        nodes[sid].capital += (p.capitalUSDm || 0);
        edges.push({ from: pid, to: sid, kind: "location" });
      }
      (p.fundingSources || []).forEach(function (f) {
        var fn = normalizeFunder(f);
        var fid = "f:" + fn;
        if (!nodes[fid]) nodes[fid] = { id: fid, type: "funder", label: fn, capital: 0, count: 0 };
        nodes[fid].count++;
        nodes[fid].capital += (p.capitalUSDm || 0) / Math.max(1, (p.fundingSources || []).length);
        edges.push({ from: pid, to: fid, kind: "finance" });
      });
    });
    return { nodes: Object.keys(nodes).map(function (k) { return nodes[k]; }), edges: edges };
  }

  function layoutNetworkPositions(graph, w, h) {
    var cx = w / 2, cy = h / 2;
    var pos = {};
    pos["inst:FMITI"] = { x: cx, y: cy };
    var states = graph.nodes.filter(function (n) { return n.type === "state"; });
    var funders = graph.nodes.filter(function (n) { return n.type === "funder"; });
    var projs = graph.nodes.filter(function (n) { return n.type === "project"; });
    states.forEach(function (n, i) {
      var a = (i / Math.max(states.length, 1)) * Math.PI * 2 - Math.PI / 2;
      pos[n.id] = { x: cx + Math.cos(a) * Math.min(w, h) * 0.28, y: cy + Math.sin(a) * Math.min(w, h) * 0.28 };
    });
    funders.forEach(function (n, i) {
      var a = (i / Math.max(funders.length, 1)) * Math.PI * 2 + Math.PI / 8;
      pos[n.id] = { x: cx + Math.cos(a) * Math.min(w, h) * 0.18, y: cy + Math.sin(a) * Math.min(w, h) * 0.18 };
    });
    projs.forEach(function (n, i) {
      var a = (i / Math.max(projs.length, 1)) * Math.PI * 2;
      var r = Math.min(w, h) * (0.38 + (n.priority === 1 ? 0.02 : 0));
      pos[n.id] = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });
    return pos;
  }

  function layoutVennPositions(graph, w, h) {
    var pos = {};
    var cx = w / 2, cy = h / 2 + 10;
    var r = Math.min(w, h) * 0.22;
    var sets = { p1: { x: cx - r * 0.55, y: cy - r * 0.2 }, bank: { x: cx + r * 0.55, y: cy - r * 0.2 }, adv: { x: cx, y: cy + r * 0.55 } };
    pos["inst:FMITI"] = { x: cx, y: 36 };
    var projs = graph.nodes.filter(function (n) { return n.type === "project"; });
    var useP1 = (document.getElementById("vennP1") || {}).checked;
    var useBank = (document.getElementById("vennBank") || {}).checked;
    var useAdv = (document.getElementById("vennAdv") || {}).checked;
    projs.forEach(function (n, i) {
      var inP1 = n.priority === 1;
      var inBank = /high/i.test(n.bankability || "");
      var inAdv = n.stage === "construction" || n.stage === "completion";
      var pts = [];
      if (useP1 && inP1) pts.push(sets.p1);
      if (useBank && inBank) pts.push(sets.bank);
      if (useAdv && inAdv) pts.push(sets.adv);
      var x, y;
      if (!pts.length) {
        x = cx + ((i % 7) - 3) * 28;
        y = h - 40 - Math.floor(i / 7) * 16;
      } else {
        x = pts.reduce(function (s, p) { return s + p.x; }, 0) / pts.length;
        y = pts.reduce(function (s, p) { return s + p.y; }, 0) / pts.length;
        x += ((i % 5) - 2) * 10;
        y += (Math.floor(i / 5) % 3 - 1) * 10;
      }
      pos[n.id] = { x: x, y: y };
    });
    graph.nodes.filter(function (n) { return n.type === "state" || n.type === "funder"; }).forEach(function (n, i) {
      pos[n.id] = { x: 40 + (i % 4) * 70, y: 30 + Math.floor(i / 4) * 22 };
    });
    return pos;
  }

  function nodeColor(n) {
    if (n.type === "inst") return "#5c4a32";
    if (n.type === "state") return "#1d4ed8";
    if (n.type === "funder") return "#b45309";
    var c = (window.SECTOR_COLORS && window.SECTOR_COLORS[n.sector]) || "#047857";
    return c;
  }

  function nodeRadius(n) {
    if (n.type === "inst") return 18;
    if (n.type === "state") return 8 + Math.min(8, (n.count || 1));
    if (n.type === "funder") return 7 + Math.min(7, (n.count || 1));
    return 5 + Math.min(10, Math.sqrt((n.capital || 0) / 200));
  }

  function renderNetwork() {
    var el = document.getElementById("netGraph");
    if (!el) return;
    var list = getNetworkFiltered();
    var graph = buildNetworkGraph(list);
    var w = el.clientWidth || 800;
    var h = el.clientHeight || 520;
    var pos = netLayout === "venn" ? layoutVennPositions(graph, w, h) : layoutNetworkPositions(graph, w, h);
    var cap = list.reduce(function (s, p) { return s + (p.capitalUSDm || 0); }, 0);
    var states = graph.nodes.filter(function (n) { return n.type === "state"; }).length;
    var funders = graph.nodes.filter(function (n) { return n.type === "funder"; }).length;
    var kc = document.getElementById("netKpiCap");
    if (kc) kc.textContent = window.formatCapital(cap);
    var kp = document.getElementById("netKpiProj");
    if (kp) kp.textContent = String(list.length);
    var ks = document.getElementById("netKpiStates");
    if (ks) ks.textContent = String(states);
    var kf = document.getElementById("netKpiFund");
    if (kf) kf.textContent = String(funders);
    var rc = document.getElementById("netResultCount");
    if (rc) rc.textContent = list.length + " projects · " + states + " states · " + funders + " funders · all linked to FMITI";
    var edgesSvg = graph.edges.map(function (e) {
      var a = pos[e.from], b = pos[e.to];
      if (!a || !b) return "";
      var stroke = e.kind === "policy" ? "#5c4a32" : e.kind === "finance" ? "#b45309" : "#94a3b8";
      var op = e.kind === "policy" ? 0.25 : 0.45;
      return '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + stroke + '" stroke-width="1.2" stroke-opacity="' + op + '"/>';
    }).join("");
    var vennSvg = "";
    if (netLayout === "venn") {
      var cx = w / 2, cy = h / 2 + 10, r = Math.min(w, h) * 0.22;
      vennSvg =
        '<circle cx="' + (cx - r * 0.55) + '" cy="' + (cy - r * 0.2) + '" r="' + r + '" fill="#047857" fill-opacity="0.12" stroke="#047857" stroke-width="1.5"/>' +
        '<circle cx="' + (cx + r * 0.55) + '" cy="' + (cy - r * 0.2) + '" r="' + r + '" fill="#1d4ed8" fill-opacity="0.12" stroke="#1d4ed8" stroke-width="1.5"/>' +
        '<circle cx="' + cx + '" cy="' + (cy + r * 0.55) + '" r="' + r + '" fill="#b45309" fill-opacity="0.12" stroke="#b45309" stroke-width="1.5"/>' +
        '<text x="' + (cx - r * 0.55) + '" y="' + (cy - r * 0.2 - r - 6) + '" text-anchor="middle" class="net-label" fill="#047857">P1</text>' +
        '<text x="' + (cx + r * 0.55) + '" y="' + (cy - r * 0.2 - r - 6) + '" text-anchor="middle" class="net-label" fill="#1d4ed8">Bankable</text>' +
        '<text x="' + cx + '" y="' + (cy + r * 0.55 + r + 14) + '" text-anchor="middle" class="net-label" fill="#b45309">Advanced stage</text>';
    }
    var nodesSvg = graph.nodes.map(function (n) {
      var p = pos[n.id];
      if (!p) return "";
      var r = nodeRadius(n);
      var col = nodeColor(n);
      var label = n.type === "project" ? (n.priority === 1 ? "P1" : "") : (n.label.length > 12 ? n.label.slice(0, 11) + "…" : n.label);
      var showLabel = n.type !== "project" || n.priority === 1;
      return '<g class="net-node" data-id="' + n.id + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="' + col + '" stroke="#fff" stroke-width="2" opacity="0.95"/>' +
        (showLabel ? '<text x="' + p.x + '" y="' + (p.y + r + 11) + '" text-anchor="middle" class="net-label">' + window.escapeHtml(label) + "</text>" : "") + "</g>";
    }).join("");
    el.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + vennSvg + edgesSvg + nodesSvg + "</svg>";
    var gs = el.querySelectorAll(".net-node");
    for (var i = 0; i < gs.length; i++) {
      gs[i].addEventListener("click", function (ev) {
        var id = ev.currentTarget.getAttribute("data-id");
        showNetNode(id, graph);
      });
    }
  }

  function showNetNode(id, graph) {
    netSelected = id;
    var n = null;
    for (var i = 0; i < graph.nodes.length; i++) if (graph.nodes[i].id === id) { n = graph.nodes[i]; break; }
    var empty = document.getElementById("netNodeEmpty");
    var det = document.getElementById("netNodeDetail");
    if (!n || !det) return;
    if (empty) empty.classList.add("hidden");
    det.classList.remove("hidden");
    var links = graph.edges.filter(function (e) { return e.from === id || e.to === id; });
    var html = "<p class=\"font-semibold text-bronze-800\">" + window.escapeHtml(n.label) + " <span class=\"text-[11px] text-bronze-500\">(" + n.type + ")</span></p>";
    if (n.type === "project" && n.ref) {
      html += "<p class=\"text-[12px] text-bronze-500\">" + window.escapeHtml(n.sector || "") + " · " + window.formatCapital(n.capital) + " · P" + (n.priority || "—") + "</p>";
      html += "<p class=\"text-[12px]\">Linked to <strong>FMITI</strong> · " + links.length + " edges</p>";
      html += '<button type="button" class="btn-ghost mt-2 text-xs" id="netOpenProfile">Open conversion profile</button>';
    } else {
      html += "<p class=\"text-[12px] text-bronze-500\">" + (n.count || 0) + " linked projects · " + window.formatCapital(n.capital) + "</p>";
      html += "<p class=\"text-[12px]\">" + links.length + " edges in current filter</p>";
    }
    det.innerHTML = html;
    var btn = document.getElementById("netOpenProfile");
    if (btn && n.ref) {
      btn.addEventListener("click", function () {
        window.switchTab("conversion");
        setTimeout(function () { window.openProfile(n.ref.id); }, 100);
      });
    }
  }

  function bindNetworkControls() {
    ["netSearch", "netSector", "netPriority"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", renderNetwork);
      el.addEventListener("change", renderNetwork);
    });
    var reset = document.getElementById("netReset");
    if (reset) reset.addEventListener("click", function () {
      var a = document.getElementById("netSearch"); if (a) a.value = "";
      var b = document.getElementById("netSector"); if (b) b.value = "all";
      var c = document.getElementById("netPriority"); if (c) c.value = "all";
      renderNetwork();
    });
    var bn = document.getElementById("netLayoutNetwork");
    var bv = document.getElementById("netLayoutVenn");
    function setLayout(mode) {
      netLayout = mode;
      if (bn) { bn.className = "px-3 py-1.5 text-xs font-semibold " + (mode === "network" ? "bg-bronze-700 text-white" : "text-bronze-600 bg-white"); }
      if (bv) { bv.className = "px-3 py-1.5 text-xs font-semibold " + (mode === "venn" ? "bg-bronze-700 text-white" : "text-bronze-600 bg-white"); }
      var sets = document.getElementById("netVennSets");
      if (sets) sets.classList.toggle("hidden", mode !== "venn");
      var note = document.getElementById("netLayoutNote");
      if (note) note.textContent = mode === "venn"
        ? "Venn overlay · toggle any/none of P1 · bankability · advanced stage"
        : "Network layout · every project links to FMITI · filter drives graph";
      renderNetwork();
    }
    if (bn) bn.addEventListener("click", function () { setLayout("network"); });
    if (bv) bv.addEventListener("click", function () { setLayout("venn"); });
    ["vennP1", "vennBank", "vennAdv"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("change", function () { if (netLayout === "venn") renderNetwork(); });
    });
  }

  window.renderNetwork = renderNetwork;
  window.bindNetworkControls = bindNetworkControls;
})();
