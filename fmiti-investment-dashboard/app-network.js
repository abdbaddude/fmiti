(function () {
  "use strict";
  /* v1.4.0 network — see artifacts for full drag implementation if this stub is present */
  var netLayout = "network";
  var netSelected = null;
  var dragPos = {};
  var lastGraph = null;

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
    return t.length > 28 ? t.slice(0, 26) + "\u2026" : t;
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
      if (pts.length) {
        x = pts.reduce(function (s, p) { return s + p.x; }, 0) / pts.length;
        y = pts.reduce(function (s, p) { return s + p.y; }, 0) / pts.length;
        x += (i % 5 - 2) * 6;
        y += (Math.floor(i / 5) % 3 - 1) * 6;
      } else {
        x = cx + ((i % 8) - 3.5) * 18;
        y = h - 40 - Math.floor(i / 8) * 16;
      }
      pos[n.id] = { x: x, y: y };
    });
    graph.nodes.filter(function (n) { return n.type === "state" || n.type === "funder"; }).forEach(function (n, i) {
      pos[n.id] = { x: 40 + (i % 6) * 50, y: 50 + Math.floor(i / 6) * 28 };
    });
    return pos;
  }

  function nodeColor(n) {
    if (n.type === "inst") return "#5c4a32";
    if (n.type === "state") return "#1d4ed8";
    if (n.type === "funder") return "#b45309";
    return (window.NICDA && window.NICDA.SECTOR_COLORS && window.NICDA.SECTOR_COLORS[n.sector]) || (window.SECTOR_COLORS && window.SECTOR_COLORS[n.sector]) || "#047857";
  }

  function nodeRadius(n) {
    if (n.type === "inst") return 18;
    if (n.type === "state") return 8 + Math.min(8, (n.count || 1));
    if (n.type === "funder") return 7 + Math.min(7, (n.count || 1));
    return 5 + Math.min(10, Math.sqrt((n.capital || 0) / 200));
  }

  function mergePositions(base, graph) {
    var pos = {};
    graph.nodes.forEach(function (n) {
      if (dragPos[n.id]) pos[n.id] = { x: dragPos[n.id].x, y: dragPos[n.id].y };
      else if (base[n.id]) pos[n.id] = { x: base[n.id].x, y: base[n.id].y };
    });
    return pos;
  }

  function formatCap(n) {
    return window.formatCapital ? window.formatCapital(n) : ("$" + (n || 0).toFixed(0) + "m");
  }

  function escape(s) {
    if (window.escapeHtml) return window.escapeHtml(s);
    return String(s == null ? "" : s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
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
    var html = "";
    if (n.type === "project" && n.ref) {
      var p = n.ref;
      html = "<p class=\"font-semibold text-bronze-800\">" + escape(p.name) + "</p>" +
        "<p class=\"text-[11px] text-bronze-500\">" + escape(p.sector || "") + " · " + escape(p.state || "") + "</p>" +
        "<p class=\"text-sm mt-1\">" + formatCap(p.capitalUSDm) + " · P" + (p.priority || "—") + " · " + escape(p.bankability || "") + "</p>" +
        "<button type=\"button\" class=\"btn-ghost text-xs mt-2\" data-open-profile=\"" + p.id + "\">Open profile</button>";
    } else if (n.type === "state") {
      var si = window.NICDA && window.NICDA.getStateIntel ? window.NICDA.getStateIntel(n.label) : null;
      html = "<p class=\"font-semibold text-bronze-800\">" + escape(n.label) + " State</p>" +
        "<p class=\"text-sm\">" + (n.count || 0) + " projects · " + formatCap(n.capital) + "</p>" +
        (si ? "<p class=\"text-[11px] mt-1\">Governor: " + escape(si.governor) + "</p>" +
          "<p class=\"text-[11px]\">FAAC: " + escape(si.faac) + " · IGR: " + escape(si.igr) + "</p>" +
          "<p class=\"text-[11px]\">Project appetite: " + escape(si.projectAppetite) + "</p>" +
          "<button type=\"button\" class=\"btn-ghost text-xs mt-2\" data-open-state=\"" + escape(n.label) + "\">State card</button>" : "");
    } else if (n.type === "funder") {
      html = "<p class=\"font-semibold text-bronze-800\">" + escape(n.label) + "</p><p class=\"text-sm\">" + (n.count || 0) + " links · ~" + formatCap(n.capital) + "</p>";
    } else {
      html = "<p class=\"font-semibold text-bronze-800\">FMITI</p><p class=\"text-sm\">Policy hub · " + (n.count || 0) + " projects · " + formatCap(n.capital) + "</p>";
    }
    html += "<p class=\"text-[10px] text-bronze-400 mt-2\">" + links.length + " edges · drag node to reposition</p>";
    det.innerHTML = html;
    var btn = det.querySelector("[data-open-profile]");
    if (btn) btn.addEventListener("click", function () {
      var pid = parseInt(btn.getAttribute("data-open-profile"), 10);
      if (window.switchTab) window.switchTab("conversion");
      setTimeout(function () { if (window.openProfile) window.openProfile(pid); }, 80);
    });
    var sb = det.querySelector("[data-open-state]");
    if (sb) sb.addEventListener("click", function () {
      if (window.openStateCard) window.openStateCard(sb.getAttribute("data-open-state"));
    });
  }

  function bindDrag(svg, pos) {
    var dragging = null, offset = { x: 0, y: 0 };
    function clientToSvg(ev) {
      var pt = svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      var ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      return pt.matrixTransform(ctm.inverse());
    }
    function onDown(ev) {
      var g = ev.target.closest(".net-node");
      if (!g) return;
      ev.preventDefault();
      dragging = g.getAttribute("data-id");
      var p = pos[dragging] || { x: 0, y: 0 };
      var c = clientToSvg(ev);
      offset = { x: c.x - p.x, y: c.y - p.y };
      g.style.cursor = "grabbing";
    }
    function onMove(ev) {
      if (!dragging) return;
      var c = clientToSvg(ev);
      var x = c.x - offset.x, y = c.y - offset.y;
      dragPos[dragging] = { x: x, y: y };
      pos[dragging] = { x: x, y: y };
      var g = svg.querySelector('.net-node[data-id="' + dragging + '"]');
      if (!g) return;
      var circle = g.querySelector("circle");
      var texts = g.querySelectorAll("text");
      var glyphs = g.querySelectorAll("path, rect");
      if (circle) { circle.setAttribute("cx", x); circle.setAttribute("cy", y); }
      glyphs.forEach(function (el) { el.setAttribute("transform", "translate(" + x + "," + y + ")"); });
      texts.forEach(function (t) {
        t.setAttribute("x", x);
        var r = parseFloat((circle && circle.getAttribute("r")) || 8);
        t.setAttribute("y", y + r + 11);
      });
      svg.querySelectorAll("line[data-edge]").forEach(function (line) {
        var fr = line.getAttribute("data-from"), to = line.getAttribute("data-to");
        if (fr === dragging || to === dragging) {
          var a = pos[fr], b = pos[to];
          if (a && b) {
            line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
            line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
          }
        }
      });
    }
    function onUp() {
      if (dragging) {
        var g = svg.querySelector('.net-node[data-id="' + dragging + '"]');
        if (g) g.style.cursor = "grab";
      }
      dragging = null;
    }
    svg.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function renderNetwork() {
    var el = document.getElementById("netGraph");
    if (!el) return;
    var list = getNetworkFiltered();
    var graph = buildNetworkGraph(list);
    lastGraph = graph;
    var w = el.clientWidth || 800, h = el.clientHeight || 520;
    var base = netLayout === "venn" ? layoutVennPositions(graph, w, h) : layoutNetworkPositions(graph, w, h);
    var pos = mergePositions(base, graph);
    var cap = list.reduce(function (s, p) { return s + (p.capitalUSDm || 0); }, 0);
    var states = graph.nodes.filter(function (n) { return n.type === "state"; }).length;
    var funders = graph.nodes.filter(function (n) { return n.type === "funder"; }).length;
    var kc = document.getElementById("netKpiCap"); if (kc) kc.textContent = formatCap(cap);
    var kp = document.getElementById("netKpiProj"); if (kp) kp.textContent = String(list.length);
    var ks = document.getElementById("netKpiStates"); if (ks) ks.textContent = String(states);
    var kf = document.getElementById("netKpiFund"); if (kf) kf.textContent = String(funders);
    var rc = document.getElementById("netResultCount");
    if (rc) rc.textContent = list.length + " projects · " + states + " states · " + funders + " funders · drag nodes · click for detail";
    var edgesSvg = graph.edges.map(function (e) {
      var a = pos[e.from], b = pos[e.to];
      if (!a || !b) return "";
      var stroke = e.kind === "policy" ? "#5c4a32" : e.kind === "finance" ? "#b45309" : "#94a3b8";
      var op = e.kind === "policy" ? 0.25 : 0.45;
      return '<line data-edge="1" data-from="' + e.from + '" data-to="' + e.to + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + stroke + '" stroke-width="1.2" stroke-opacity="' + op + '"/>';
    }).join("");
    var vennSvg = "";
    if (netLayout === "venn") {
      var cx = w / 2, cy = h / 2 + 10, r = Math.min(w, h) * 0.22;
      vennSvg =
        '<circle cx="' + (cx - r * 0.55) + '" cy="' + (cy - r * 0.2) + '" r="' + r + '" fill="#047857" fill-opacity="0.12" stroke="#047857" stroke-width="1.5"/>' +
        '<circle cx="' + (cx + r * 0.55) + '" cy="' + (cy - r * 0.2) + '" r="' + r + '" fill="#1d4ed8" fill-opacity="0.12" stroke="#1d4ed8" stroke-width="1.5"/>' +
        '<circle cx="' + cx + '" cy="' + (cy + r * 0.55) + '" r="' + r + '" fill="#b45309" fill-opacity="0.12" stroke="#b45309" stroke-width="1.5"/>';
    }
    var glyphFn = (window.NICDA && window.NICDA.nodeGlyph) || function () { return ""; };
    var nodesSvg = graph.nodes.map(function (n) {
      var p = pos[n.id];
      if (!p) return "";
      var r = nodeRadius(n), col = nodeColor(n);
      var label = n.type === "project" ? (n.priority === 1 ? "P1" : "") : (n.label.length > 12 ? n.label.slice(0, 11) + "\u2026" : n.label);
      var showLabel = n.type !== "project" || n.priority === 1;
      var glyph = glyphFn(n.type, n.sector, r);
      return '<g class="net-node" data-id="' + n.id + '" style="cursor:grab"><circle cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="' + col + '" stroke="#fff" stroke-width="2" opacity="0.95"/><g transform="translate(' + p.x + ',' + p.y + ')">' + glyph + '</g>' + (showLabel ? '<text x="' + p.x + '" y="' + (p.y + r + 11) + '" text-anchor="middle" class="net-label">' + escape(label) + '</text>' : '') + '</g>';
    }).join("");
    el.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" style="touch-action:none">' + vennSvg + edgesSvg + nodesSvg + '</svg>';
    var svg = el.querySelector("svg");
    if (svg) bindDrag(svg, pos);
    var gs = el.querySelectorAll(".net-node");
    for (var i = 0; i < gs.length; i++) {
      gs[i].addEventListener("click", function (ev) {
        showNetNode(ev.currentTarget.getAttribute("data-id"), graph);
      });
    }
    if (netSelected) showNetNode(netSelected, graph);
  }

  function bindNetworkControls() {
    ["netSearch", "netSector", "netPriority"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () { dragPos = {}; renderNetwork(); });
      el.addEventListener("change", function () { dragPos = {}; renderNetwork(); });
    });
    var bn = document.getElementById("netLayoutNetwork");
    var bv = document.getElementById("netLayoutVenn");
    function setLayout(mode) {
      netLayout = mode;
      dragPos = {};
      if (bn) bn.className = "px-3 py-1.5 text-xs font-semibold " + (mode === "network" ? "bg-bronze-700 text-white" : "text-bronze-600 bg-white");
      if (bv) bv.className = "px-3 py-1.5 text-xs font-semibold " + (mode === "venn" ? "bg-bronze-700 text-white" : "text-bronze-600 bg-white");
      var sets = document.getElementById("netVennSets");
      if (sets) sets.classList.toggle("hidden", mode !== "venn");
      renderNetwork();
    }
    if (bn) bn.addEventListener("click", function () { setLayout("network"); });
    if (bv) bv.addEventListener("click", function () { setLayout("venn"); });
    ["vennP1", "vennBank", "vennAdv"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("change", function () { if (netLayout === "venn") { dragPos = {}; renderNetwork(); } });
    });
  }

  window.renderNetwork = renderNetwork;
  window.bindNetworkControls = bindNetworkControls;
  window.refreshNetworkCurrency = function () {
    if (window.renderNetwork) renderNetwork();
  };
})();
