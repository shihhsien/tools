/* @ds-bundle: {"format":3,"namespace":"NYCRestaurantGradeDesignSystem_09ad2a","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"GradeBadge","sourcePath":"components/core/GradeBadge.jsx"},{"name":"GradePlacard","sourcePath":"components/core/GradePlacard.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Logomark","sourcePath":"components/core/Logomark.jsx"},{"name":"ResultCard","sourcePath":"components/core/ResultCard.jsx"},{"name":"StatusLine","sourcePath":"components/core/StatusLine.jsx"}],"sourceHashes":{"components/core/Button.jsx":"76280ebe5781","components/core/Card.jsx":"47a576955dbc","components/core/Divider.jsx":"a300d6484db1","components/core/GradeBadge.jsx":"14572ee8e13d","components/core/GradePlacard.jsx":"7f4ff6d56027","components/core/Input.jsx":"4debfa0f6993","components/core/Logomark.jsx":"73f455d1f610","components/core/ResultCard.jsx":"d156afe16a01","components/core/StatusLine.jsx":"1ed2da4a1e0d","ui_kits/grade-lookup/App.jsx":"6952a7b808f7","ui_kits/grade-lookup/Header.jsx":"6d3ea1ba67be"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NYCRestaurantGradeDesignSystem_09ad2a = window.NYCRestaurantGradeDesignSystem_09ad2a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  children,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
      width: "100%",
      marginTop: "var(--space-5)",
      padding: "15px 18px",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-button)",
      fontWeight: "var(--weight-semibold)",
      border: "none",
      borderRadius: "var(--radius-lg)",
      background: "var(--surface-inverse)",
      color: "var(--text-inverse)",
      opacity: disabled ? 0.45 : 1,
      cursor: disabled ? "default" : "pointer",
      transition: "opacity .12s ease",
      ...style
    },
    onPointerDown: e => {
      if (!disabled) e.currentTarget.style.opacity = "0.7";
    },
    onPointerUp: e => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    },
    onPointerLeave: e => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--surface-card)",
      border: "var(--border-width) solid var(--border-default)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--space-7)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Divider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Divider({
  label,
  style,
  ...rest
}) {
  const line = {
    content: '""',
    flex: 1,
    height: "1px",
    background: "var(--border-default)"
  };
  if (!label) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        height: "1px",
        background: "var(--border-default)",
        ...style
      }
    }, rest));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: "12px 0 4px",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: line
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-eyebrow)",
      color: "var(--text-tertiary)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-eyebrow)",
      whiteSpace: "nowrap"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: line
  }));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Divider.jsx", error: String((e && e.message) || e) }); }

// components/core/GradeBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function GradeBadge({
  grade = "A",
  soft = false,
  size = 48,
  style,
  ...rest
}) {
  const known = ["A", "B", "C"];
  const letter = grade == null || grade === "" ? "?" : String(grade);
  const isKnown = known.includes(letter.toUpperCase());
  const isMulti = letter.length > 1;
  const tone = {
    A: "var(--grade-pass)",
    B: "var(--grade-caution)",
    C: "var(--grade-fail)"
  }[letter.toUpperCase()] || "var(--grade-pending)";
  const base = {
    flex: "0 0 auto",
    width: size,
    height: size,
    lineHeight: `${size}px`,
    textAlign: "center",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-bold)",
    fontSize: isMulti || !isKnown ? Math.round(size * 0.31) : Math.round(size * 0.54),
    userSelect: "none"
  };
  const skin = soft ? {
    background: "color-mix(in srgb, " + tone + " 18%, transparent)",
    color: tone,
    boxShadow: "inset 0 0 0 1px color-mix(in srgb, " + tone + " 45%, transparent)"
  } : {
    background: tone,
    color: "var(--text-on-grade)"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      ...base,
      ...skin,
      ...style
    }
  }, rest), letter);
}
Object.assign(__ds_scope, { GradeBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/GradeBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/GradePlacard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function GradePlacard({
  grade = "A",
  size = 200,
  style,
  ...rest
}) {
  const letter = String(grade || "").toUpperCase();
  const pending = letter === "PENDING" || letter === "P" || letter === "";
  const ink = pending ? "var(--placard-pending)" : {
    A: "var(--grade-a)",
    B: "var(--grade-b)",
    C: "var(--grade-c)"
  }[letter] || "var(--placard-pending)";
  const w = size;
  const h = Math.round(size * 1.28);
  const pad = Math.round(size * 0.1);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: w,
      height: h,
      background: "var(--placard-paper)",
      borderRadius: Math.round(size * 0.03),
      boxShadow: "var(--shadow-overlay)",
      padding: `${pad}px ${pad}px ${Math.round(pad * 0.8)}px`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "var(--font-sans)",
      color: ink,
      boxSizing: "border-box",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      textAlign: "center",
      borderBottom: `${Math.max(2, size * 0.012)}px solid ${ink}`,
      paddingBottom: Math.round(size * 0.04)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: Math.round(size * 0.078),
      fontWeight: 700,
      letterSpacing: "0.02em",
      lineHeight: 1.1,
      fontStretch: "condensed",
      textTransform: "uppercase"
    }
  }, "Sanitary Inspection"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: Math.round(size * 0.115),
      fontWeight: 800,
      letterSpacing: "0.04em",
      lineHeight: 1.05,
      fontStretch: "condensed",
      textTransform: "uppercase"
    }
  }, "Grade")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%"
    }
  }, pending ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontWeight: 800,
      lineHeight: 0.95,
      letterSpacing: "0.01em",
      fontSize: Math.round(size * 0.2),
      textTransform: "uppercase"
    }
  }, "Grade", /*#__PURE__*/React.createElement("br", null), "Pending") : /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: Math.round(size * 0.62),
      lineHeight: 1,
      letterSpacing: "-0.02em"
    }
  }, letter)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      textAlign: "center",
      borderTop: `${Math.max(1, size * 0.006)}px solid ${ink}`,
      paddingTop: Math.round(size * 0.04)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: Math.round(size * 0.05),
      fontWeight: 600,
      letterSpacing: "0.02em",
      lineHeight: 1.25,
      textTransform: "uppercase"
    }
  }, "New York City Department of", /*#__PURE__*/React.createElement("br", null), "Health and Mental Hygiene")));
}
Object.assign(__ds_scope, { GradePlacard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/GradePlacard.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  variant = "default",
  style,
  ...rest
}) {
  const accent = variant === "accent";
  return /*#__PURE__*/React.createElement("input", _extends({
    style: {
      flex: 1,
      width: "100%",
      padding: "14px",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-input)",
      background: accent ? "var(--surface-accent)" : "var(--surface-card)",
      border: "1px solid " + (accent ? "var(--border-accent)" : "var(--border-default)"),
      borderRadius: "var(--radius-lg)",
      color: "var(--text-primary)",
      outline: "none",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Logomark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Logomark({
  layout = "horizontal",
  grade = "A",
  size = 40,
  showWordmark = true,
  style,
  ...rest
}) {
  const tone = {
    A: "var(--grade-pass)",
    B: "var(--grade-caution)",
    C: "var(--grade-fail)"
  }[String(grade).toUpperCase()] || "var(--grade-pending)";
  const radius = Math.round(size * 0.22);
  const chip = /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: tone,
      color: "var(--text-on-grade)",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--weight-bold)",
      fontSize: Math.round(size * 0.57),
      borderRadius: radius,
      userSelect: "none"
    }
  }, String(grade));
  if (!showWordmark) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: "inline-flex",
        ...style
      }
    }, rest), chip);
  }
  const stacked = layout === "stacked";
  const wordSize = stacked ? Math.round(size * 0.42) : Math.round(size * 0.5);
  const word = /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--weight-semibold)",
      fontSize: wordSize,
      letterSpacing: "-0.01em",
      lineHeight: 1.05,
      textAlign: stacked ? "center" : "left",
      whiteSpace: stacked ? "normal" : "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-primary)"
    }
  }, "NYC Restaurant"), stacked ? /*#__PURE__*/React.createElement("br", null) : " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, "Grade"));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "inline-flex",
      flexDirection: stacked ? "column" : "row",
      alignItems: "center",
      gap: stacked ? Math.round(size * 0.22) : Math.round(size * 0.3),
      ...style
    }
  }, rest), chip, word);
}
Object.assign(__ds_scope, { Logomark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logomark.jsx", error: String((e && e.message) || e) }); }

// components/core/ResultCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ResultCard({
  grade,
  name = "Unknown",
  address,
  score,
  gradedDate,
  inspectedDate,
  inspectionType,
  violation,
  criticalFlag,
  pending = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    style: {
      marginTop: "var(--space-6)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "12px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.GradeBadge, {
    grade: pending ? "?" : grade
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-name)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-primary)"
    }
  }, name), address ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      color: "var(--text-secondary)",
      marginTop: "2px"
    }
  }, address) : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      marginTop: "10px",
      lineHeight: "var(--leading-snug)",
      color: "var(--text-primary)"
    }
  }, pending ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--grade-caution)"
    }
  }, "No letter grade on record yet") : /*#__PURE__*/React.createElement("span", null, "Grade ", /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: "var(--weight-semibold)"
    }
  }, grade), score != null ? /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 score ", score) : null, gradedDate ? /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 graded ", gradedDate) : null), pending && score != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, " (latest score ", score, ")") : null), inspectedDate ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      marginTop: "10px",
      color: "var(--text-secondary)"
    }
  }, "Last inspection: ", inspectedDate, inspectionType ? ` · ${inspectionType}` : "") : null, violation ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-small)",
      color: "var(--text-secondary)",
      marginTop: "6px",
      lineHeight: "var(--leading-snug)"
    }
  }, "Latest cited", criticalFlag ? ` (${criticalFlag})` : "", ": ", violation) : null);
}
Object.assign(__ds_scope, { ResultCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ResultCard.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusLine.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatusLine({
  children,
  tone = "default",
  style,
  ...rest
}) {
  const color = tone === "error" ? "var(--text-error)" : "var(--text-secondary)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-body)",
      color,
      margin: "14px 2px",
      lineHeight: "var(--leading-snug)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { StatusLine });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusLine.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grade-lookup/App.jsx
try { (() => {
const {
  useState,
  useRef
} = React;

// ---- Mock DOHMH data (stand-in for the live 43nn-pn8j API) ------------
const DATA = [{
  dba: "JOE'S PIZZA",
  grade: "A",
  score: 12,
  building: "7",
  street: "CARMINE ST",
  boro: "Manhattan",
  zip: "10014",
  graded: "Mar 3, 2025",
  inspected: "Mar 3, 2025",
  type: "Cycle Inspection / Re-inspection",
  viol: "Non-food contact surface improperly constructed.",
  flag: "Not Critical"
}, {
  dba: "OITA",
  grade: "A",
  score: 9,
  building: "21",
  street: "PELL ST",
  boro: "Manhattan",
  zip: "10013",
  graded: "Jan 14, 2025",
  inspected: "Jan 14, 2025",
  type: "Cycle Inspection / Initial",
  viol: "Food contact surface not properly washed.",
  flag: "Critical"
}, {
  dba: "MAZZAT",
  grade: "B",
  score: 19,
  building: "208",
  street: "COLUMBIA ST",
  boro: "Brooklyn",
  zip: "11231",
  graded: "Feb 2, 2025",
  inspected: "Feb 2, 2025",
  type: "Cycle Inspection / Re-inspection",
  viol: "Cold food held above 41°F.",
  flag: "Critical"
}, {
  dba: "GOLDEN DRAGON",
  grade: "C",
  score: 41,
  building: "140",
  street: "ROOSEVELT AVE",
  boro: "Queens",
  zip: "11354",
  graded: "Apr 9, 2025",
  inspected: "Apr 9, 2025",
  type: "Cycle Inspection / Re-inspection",
  viol: "Evidence of mice or live mice present.",
  flag: "Critical"
}, {
  dba: "NEW SPOT CAFE",
  grade: null,
  score: 9,
  building: "55",
  street: "BEDFORD AVE",
  boro: "Brooklyn",
  zip: "11211",
  graded: null,
  inspected: "May 1, 2025",
  type: "Pre-permit (Operational) / Initial",
  viol: "",
  flag: ""
}];
const fmtAddr = r => `${r.building} ${r.street}, ${r.boro} ${r.zip}`.replace(/\s+/g, " ").trim();

// Progressive word-drop search against the mock set
function lookup(rawName, loc) {
  const name = rawName.trim().toUpperCase();
  if (!name) return {
    kind: "empty"
  };
  const words = name.split(/\s+/);
  for (let len = words.length; len >= 1; len--) {
    const q = words.slice(0, len).join(" ");
    let hits = DATA.filter(r => r.dba.includes(q));
    if (loc) {
      const L = loc.trim().toUpperCase();
      hits = hits.filter(r => fmtAddr(r).toUpperCase().includes(L) || r.boro.toUpperCase().includes(L) || r.zip === loc.trim());
    }
    if (hits.length) return {
      kind: "ok",
      hits,
      shortened: len < words.length ? name : null
    };
  }
  return {
    kind: "none",
    name
  };
}

// Extract a place name from a /maps/place/NAME or ?q=NAME URL (no network)
function nameFromUrl(url) {
  const isName = s => s.length > 1 && /[a-zA-Z]/.test(s) && !/[?=&]/.test(s) && !/^https?:\/\//i.test(s);
  const place = url.match(/\/maps\/place\/([^/@?&"'\s]+)/);
  if (place) {
    const n = decodeURIComponent(place[1].replace(/\+/g, " ")).trim();
    return isName(n) ? n : "";
  }
  try {
    const q = (new URL(url).searchParams.get("q") || "").trim();
    return isName(q) ? q : "";
  } catch {
    return "";
  }
}
function App() {
  const {
    Header,
    SearchPanel
  } = window.GradeLookupKit;
  const {
    StatusLine,
    ResultCard
  } = window.NYCRestaurantGradeDesignSystem_09ad2a;
  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  const [maps, setMaps] = useState("");
  const [status, setStatus] = useState(null);
  const [statusTone, setStatusTone] = useState("default");
  const [results, setResults] = useState([]);
  function runSearch(nm = name, lc = loc) {
    const res = lookup(nm, lc);
    if (res.kind === "empty") {
      setStatus("Enter a restaurant name.");
      setStatusTone("default");
      setResults([]);
      return;
    }
    if (res.kind === "none") {
      setStatus(`No active record for "${res.name}". Try a shorter name, drop the location, or check spelling.`);
      setStatusTone("default");
      setResults([]);
      return;
    }
    const note = res.shortened ? ` · shortened from "${res.shortened}"` : "";
    setStatus(`${res.hits.length} match${res.hits.length > 1 ? "es" : ""} · official data${note}`);
    setStatusTone("default");
    setResults(res.hits);
  }
  function onMaps(val) {
    setMaps(val);
    if (!val.trim().startsWith("http")) return;
    const nm = nameFromUrl(val.trim());
    if (nm) {
      const split = nm.split(",");
      const place = split[0].trim();
      const boro = (val.match(/Brooklyn|Manhattan|Queens|Bronx|Staten Island/i) || [""])[0];
      setName(place);
      if (boro) setLoc(boro);
      setMaps("");
      runSearch(place, boro);
    } else {
      setStatusTone("error");
      setStatus("__maps_error__");
      setResults([]);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--layout-max)",
      margin: "0 auto",
      padding: "16px 16px 60px"
    }
  }, /*#__PURE__*/React.createElement(Header, null), /*#__PURE__*/React.createElement(SearchPanel, {
    name: name,
    loc: loc,
    maps: maps,
    onName: setName,
    onLoc: setLoc,
    onMaps: onMaps,
    onSearch: () => runSearch()
  }), status === "__maps_error__" ? /*#__PURE__*/React.createElement(StatusLine, {
    tone: "error"
  }, "Couldn't find a restaurant name in this link.", " ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      color: "var(--text-link)",
      textDecoration: "none"
    }
  }, "Open it \u2197"), " ", "\u2014 once the map loads, copy the full URL from the address bar and paste it here, or type the name above.") : status ? /*#__PURE__*/React.createElement(StatusLine, {
    tone: statusTone
  }, status) : null, results.map((r, i) => /*#__PURE__*/React.createElement(ResultCard, {
    key: i,
    grade: r.grade,
    pending: !r.grade,
    name: r.dba,
    address: fmtAddr(r),
    score: r.score,
    gradedDate: r.graded,
    inspectedDate: r.inspected,
    inspectionType: r.type,
    violation: r.viol,
    criticalFlag: r.flag
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "10px 16px",
      fontSize: "var(--text-eyebrow)",
      color: "var(--text-tertiary)",
      background: "var(--surface-page)",
      borderTop: "1px solid var(--border-default)",
      textAlign: "left"
    }
  }, "v1.12.9"));
}
window.GradeLookupApp = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grade-lookup/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grade-lookup/Header.jsx
try { (() => {
function Header() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "16px"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-title)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-primary)",
      margin: "4px 0 2px"
    }
  }, "NYC Restaurant Grade"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-small)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-normal)"
    }
  }, "Official NYC Health Dept data (DOHMH). Name + optional location (street, borough, or ZIP \u2014 not neighborhood)."));
}
function SearchPanel({
  name,
  loc,
  maps,
  onName,
  onLoc,
  onMaps,
  onSearch
}) {
  const {
    Input,
    Divider,
    Button
  } = window.NYCRestaurantGradeDesignSystem_09ad2a;
  const onEnter = e => {
    if (e.key === "Enter") onSearch();
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    value: name,
    onChange: e => onName(e.target.value),
    onKeyDown: onEnter,
    placeholder: "Restaurant name",
    autoCapitalize: "characters",
    autoComplete: "off"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      marginTop: "8px"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    value: loc,
    onChange: e => onLoc(e.target.value),
    onKeyDown: onEnter,
    placeholder: "Street, borough, or ZIP (optional)",
    autoCapitalize: "words",
    autoComplete: "off"
  })), /*#__PURE__*/React.createElement(Divider, {
    label: "or paste a link"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    variant: "accent",
    value: maps,
    onChange: e => onMaps(e.target.value),
    placeholder: "Paste a Google Maps link\u2026",
    autoComplete: "off",
    autoCapitalize: "none"
  })), /*#__PURE__*/React.createElement(Button, {
    onClick: onSearch
  }, "Look up grade"));
}
window.GradeLookupKit = {
  Header,
  SearchPanel
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grade-lookup/Header.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.GradeBadge = __ds_scope.GradeBadge;

__ds_ns.GradePlacard = __ds_scope.GradePlacard;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Logomark = __ds_scope.Logomark;

__ds_ns.ResultCard = __ds_scope.ResultCard;

__ds_ns.StatusLine = __ds_scope.StatusLine;

})();
