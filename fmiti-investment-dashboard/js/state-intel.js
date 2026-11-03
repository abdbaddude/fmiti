/**
 * State intelligence — short, precise. Unknown fields = N/A.
 * Governor names: public office-holders as commonly reported; verify before commercial use.
 * FAAC / IGR: not loaded live in this demo → N/A.
 * Project appetite: derived from this pipeline only (count + capital in state).
 * Updated: 3 Nov 2026
 */
(function (w) {
  "use strict";
  w.NICDA = w.NICDA || {};

  var HINTS = {
    Lagos: { governor: "Babajide Sanwo-Olu", note: "Commercial hub" },
    Rivers: { governor: "Siminalayi Fubara", note: "Oil-producing" },
    Delta: { governor: "Sheriff Oborevwori", note: "Oil-producing" },
    "Akwa Ibom": { governor: "Umo Eno", note: "Oil-producing" },
    Ondo: { governor: "Lucky Aiyedatiwa", note: null },
    Ogun: { governor: "Dapo Abiodun", note: "Industrial corridor" },
    Kano: { governor: "Abba Yusuf", note: null },
    Kaduna: { governor: "Uba Sani", note: null },
    FCT: { governor: "N/A (Minister of FCT)", note: "Federal capital" },
    Kogi: { governor: "Ahmed Usman Ododo", note: null },
    Bayelsa: { governor: "Douye Diri", note: "Oil-producing" },
    Edo: { governor: "Monday Okpebholo", note: null },
    Anambra: { governor: "Chukwuma Soludo", note: null },
    Enugu: { governor: "Peter Mbah", note: null },
    Imo: { governor: "Hope Uzodinma", note: null },
    Abia: { governor: "Alex Otti", note: null },
    "Cross River": { governor: "Bassey Otu", note: null },
    Benue: { governor: "Hyacinth Alia", note: null },
    Plateau: { governor: "Caleb Mutfwang", note: null },
    Niger: { governor: "Mohammed Bago", note: null },
    Kwara: { governor: "AbdulRahman AbdulRazaq", note: null },
    Oyo: { governor: "Seyi Makinde", note: null },
    Osun: { governor: "Ademola Adeleke", note: null },
    Ekiti: { governor: "Biodun Oyebanji", note: null },
    Nasarawa: { governor: "Abdullahi Sule", note: null },
    Gombe: { governor: "Inuwa Yahaya", note: null },
    Bauchi: { governor: "Bala Mohammed", note: null },
    Borno: { governor: "Babagana Zulum", note: null },
    Yobe: { governor: "Mai Mala Buni", note: null },
    Sokoto: { governor: "Ahmad Aliyu", note: null },
    Kebbi: { governor: "Nasir Idris", note: null },
    Zamfara: { governor: "Dauda Lawal", note: null },
    Katsina: { governor: "Dikko Radda", note: null },
    Jigawa: { governor: "Umar Namadi", note: null },
    Taraba: { governor: "Agbu Kefas", note: null },
    Adamawa: { governor: "Ahmadu Fintiri", note: null }
  };

  function appetiteLabel(count, capitalUSDm) {
    if (!count) return "Low";
    if (count >= 4 || capitalUSDm >= 5000) return "High";
    if (count >= 2 || capitalUSDm >= 1000) return "Medium";
    return "Low";
  }

  w.NICDA.getStateIntel = function (stateName) {
    var name = stateName || "";
    var hint = HINTS[name] || {};
    var projects = (w.PROJECTS || []).filter(function (p) { return p.state === name; });
    var capital = projects.reduce(function (s, p) { return s + (p.capitalUSDm || 0); }, 0);
    return {
      state: name || "N/A",
      governor: hint.governor || "N/A",
      faac: "N/A",
      igr: "N/A",
      faacAsOf: "N/A",
      igrAsOf: "N/A",
      projectCount: projects.length,
      capitalUSDm: capital,
      projectAppetite: appetiteLabel(projects.length, capital),
      note: hint.note || null,
      projects: projects
    };
  };

  w.NICDA.stateThumbSvg = function (stateName) {
    var label = (stateName || "?").slice(0, 3).toUpperCase();
    return (
      '<svg width="36" height="28" viewBox="0 0 36 28" class="inline-block align-middle ml-1 shrink-0" aria-hidden="true">' +
      '<rect x="1" y="1" width="34" height="26" rx="4" fill="#f0ebe3" stroke="#e2d6c4"/>' +
      '<path d="M8 20 L12 8 L18 14 L24 6 L28 18 Z" fill="#5c4a32" opacity="0.35"/>' +
      '<text x="18" y="17" text-anchor="middle" font-size="7" font-family="Helvetica Neue,Arial,sans-serif" fill="#3d3224" font-weight="600">' +
      label +
      "</text></svg>"
    );
  };
})(window);
