/* @ds-bundle: {"format":3,"namespace":"NYCRestaurantGradeDesignSystem_09ad2a","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"ClosureBanner","sourcePath":"components/core/ClosureBanner.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"GradeBadge","sourcePath":"components/core/GradeBadge.jsx"},{"name":"GradePlacard","sourcePath":"components/core/GradePlacard.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"InspectionHistory","sourcePath":"components/core/InspectionHistory.jsx"},{"name":"Logomark","sourcePath":"components/core/Logomark.jsx"},{"name":"ResultCard","sourcePath":"components/core/ResultCard.jsx"},{"name":"ScoreBar","sourcePath":"components/core/ScoreBar.jsx"},{"name":"StatusLine","sourcePath":"components/core/StatusLine.jsx"},{"name":"Trend","sourcePath":"components/core/Trend.jsx"},{"name":"ViolationsList","sourcePath":"components/core/ViolationsList.jsx"}],"sourceHashes":{"components/core/Button.jsx":"3aba09ec878d","components/core/Card.jsx":"47a576955dbc","components/core/Chip.jsx":"e004e8f936bc","components/core/ClosureBanner.jsx":"340f42670cfc","components/core/Divider.jsx":"a300d6484db1","components/core/GradeBadge.jsx":"14572ee8e13d","components/core/GradePlacard.jsx":"5a414b9c8d75","components/core/Input.jsx":"49ffba7bbafb","components/core/InspectionHistory.jsx":"ef79511a734b","components/core/Logomark.jsx":"73f455d1f610","components/core/ResultCard.jsx":"be7804f47283","components/core/ScoreBar.jsx":"06c8963356c9","components/core/StatusLine.jsx":"1ed2da4a1e0d","components/core/Trend.jsx":"9f29c87fe264","components/core/ViolationsList.jsx":"3eeb8f606d7a","ui_kits/grade-lookup/App.jsx":"5473dc6d5b66","ui_kits/grade-lookup/Header.jsx":"b58a124fe78e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.NYCRestaurantGradeDesignSystem_09ad2a = window.NYCRestaurantGradeDesignSystem_09ad2a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  children,
  variant = "primary",
  disabled = false,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [ring, setRing] = React.useState(false);
  const secondary = variant === "secondary";
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
      width: "100%",
      marginTop: secondary ? "var(--space-4)" : "var(--space-5)",
      padding: secondary ? "12px 18px" : "15px 18px",
      fontFamily: "var(--font-sans)",
      fontSize: secondary ? "15px" : "var(--text-button)",
      fontWeight: "var(--weight-semibold)",
      border: secondary ? "1px solid var(--border-default)" : "none",
      borderRadius: "var(--radius-lg)",
      background: secondary ? "var(--surface-card)" : "var(--surface-inverse)",
      color: secondary ? "var(--text-primary)" : "var(--text-inverse)",
      opacity: disabled ? 0.45 : 1,
      cursor: disabled ? "default" : "pointer",
      outline: "none",
      boxShadow: ring ? "var(--focus-ring)" : "none",
      transition: "opacity var(--motion-fast), box-shadow var(--motion-fast)",
      ...style
    },
    onPointerDown: e => {
      if (!disabled) e.currentTarget.style.opacity = "var(--press-opacity)";
    },
    onPointerUp: e => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    },
    onPointerLeave: e => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    },
    onFocus: e => {
      setRing(e.currentTarget.matches(":focus-visible"));
      if (onFocus) onFocus(e);
    },
    onBlur: e => {
      setRing(false);
      if (onBlur) onBlur(e);
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

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Chip({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    style: {
      width: "auto",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-small)",
      padding: "5px 10px",
      borderRadius: "14px",
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      color: "var(--text-primary)",
      cursor: "pointer",
      transition: "opacity var(--motion-fast)",
      ...style
    },
    onPointerDown: e => {
      e.currentTarget.style.opacity = "var(--press-opacity)";
    },
    onPointerUp: e => {
      e.currentTarget.style.opacity = "1";
    },
    onPointerLeave: e => {
      e.currentTarget.style.opacity = "1";
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/ClosureBanner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ClosureBanner({
  date,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      marginBottom: "10px",
      padding: "8px 12px",
      borderRadius: "var(--radius-sm)",
      fontSize: "var(--text-body)",
      fontWeight: "var(--weight-semibold)",
      fontFamily: "var(--font-sans)",
      background: "rgba(248,113,113,.1)",
      color: "var(--text-error)",
      border: "1px solid rgba(248,113,113,.25)",
      ...style
    }
  }, rest), "\u26A0 Closed by DOHMH", date ? ` · ${date}` : "");
}
Object.assign(__ds_scope, { ClosureBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ClosureBanner.jsx", error: String((e && e.message) || e) }); }

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
  const g = String(grade || "").toUpperCase();
  const known = ["A", "B", "C"].includes(g);
  const pending = !known;
  const ink = pending ? "#1a1a1a" : {
    A: "var(--grade-a)",
    B: "var(--grade-b)",
    C: "var(--grade-c)"
  }[g];
  const k = size / 200; // production card is 200px wide
  const px = v => Math.max(1, Math.round(v * k));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: size,
      background: "var(--placard-paper)",
      borderRadius: px(4),
      padding: `${px(10)}px ${px(14)}px ${px(12)}px`,
      textAlign: "center",
      fontFamily: "var(--font-placard)",
      boxShadow: "var(--shadow-placard)",
      color: ink,
      boxSizing: "border-box",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: px(6),
      marginBottom: px(6),
      borderBottom: `${pending ? px(1) : px(2)}px solid ${ink}`,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: px(9),
      opacity: 0.8
    }
  }, "Sanitary Inspection"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: px(13),
      fontWeight: 900,
      letterSpacing: "0.12em",
      marginTop: px(2)
    }
  }, "Grade")), pending ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: px(22),
      fontWeight: 700,
      lineHeight: 1.2,
      margin: `${px(16)}px 0`,
      letterSpacing: "0.02em",
      textTransform: "uppercase"
    }
  }, "Grade", /*#__PURE__*/React.createElement("br", null), "Pending") : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: px(110),
      fontWeight: 900,
      lineHeight: 1,
      margin: `${px(4)}px 0 ${px(2)}px`,
      letterSpacing: "-0.02em"
    }
  }, g), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: px(6),
      marginTop: px(4),
      borderTop: `1px solid ${ink}`,
      fontSize: px(8),
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }
  }, "NYC Dept of Health & Mental Hygiene"));
}
Object.assign(__ds_scope, { GradePlacard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/GradePlacard.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  variant = "default",
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const accent = variant === "accent";
  const restingBorder = accent ? "var(--border-accent)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("input", _extends({
    style: {
      flex: 1,
      width: "100%",
      padding: "14px",
      boxSizing: "border-box",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-input)",
      background: accent ? "var(--surface-accent)" : "var(--surface-card)",
      border: "1px solid " + (focused ? "var(--focus-border)" : restingBorder),
      borderRadius: "var(--radius-lg)",
      color: "var(--text-primary)",
      outline: "none",
      boxShadow: focused ? "var(--focus-ring)" : "none",
      transition: "border-color var(--motion-fast), box-shadow var(--motion-fast)",
      ...style
    },
    onFocus: e => {
      setFocused(true);
      if (onFocus) onFocus(e);
    },
    onBlur: e => {
      setFocused(false);
      if (onBlur) onBlur(e);
    }
  }, rest));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/InspectionHistory.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function InspectionHistory({
  history = [],
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  if (history.length < 2) return null;
  const chipColor = g => ({
    A: "var(--grade-a)",
    B: "var(--grade-b-dense)",
    C: "var(--grade-c-dense)"
  })[String(g || "").toUpperCase()] || "var(--color-gray)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      marginTop: "8px",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(!open),
    style: {
      all: "unset",
      display: "block",
      fontSize: "12px",
      color: "var(--text-secondary)",
      cursor: "pointer",
      padding: "2px 0",
      userSelect: "none"
    }
  }, open ? "▾" : "▸", "\xA0\xA0Inspection history"), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "6px"
    }
  }, history.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      padding: "4px 0",
      borderTop: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)",
      flex: "0 0 90px"
    }
  }, r.date), r.closed ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-error)"
    }
  }, "Closed") : /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "22px",
      height: "22px",
      borderRadius: "5px",
      fontWeight: "var(--weight-bold)",
      fontSize: "11px",
      color: "#fff",
      flexShrink: 0,
      background: chipColor(r.grade)
    }
  }, r.grade || "—"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)",
      flex: "0 0 auto"
    }
  }, r.score != null ? r.score : "—"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)",
      fontSize: "11px",
      flex: 1,
      textAlign: "right",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, r.type || "")))) : null);
}
Object.assign(__ds_scope, { InspectionHistory });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/InspectionHistory.jsx", error: String((e && e.message) || e) }); }

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

// components/core/ScoreBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ScoreBar({
  score,
  grade,
  max = 40,
  style,
  ...rest
}) {
  const s = parseInt(score, 10);
  if (isNaN(s)) return null;
  const g = String(grade || "").toUpperCase();
  const pct = Math.min(100, Math.round(s / max * 100));
  const fill = {
    A: "var(--grade-a)",
    B: "var(--grade-b)",
    C: "var(--grade-c)"
  }[g] || "var(--color-gray)";
  let note = "";
  if (s <= 5 && g === "A") note = "Excellent";else if (s >= 11 && s <= 13) {
    const d = 14 - s;
    note = `${d} pt${d > 1 ? "s" : ""} from B`;
  } else if (s >= 24 && s <= 27 && g === "B") {
    const d = 28 - s;
    note = `${d} pt${d > 1 ? "s" : ""} from C`;
  }
  const tick = (left, label) => /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "-3px",
      left,
      width: "1px",
      height: "10px",
      background: "var(--color-muted)",
      opacity: 0.4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "11px",
      left: "-4px",
      fontSize: "9px",
      color: "var(--text-secondary)"
    }
  }, label));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      margin: "8px 0 4px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: "relative",
      height: "4px",
      background: "var(--border-default)",
      borderRadius: "2px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: "2px",
      width: `${pct}%`,
      background: fill
    }
  }), tick("35%", "B"), tick("70%", "C")), note ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px",
      color: "var(--text-secondary)",
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, note) : null);
}
Object.assign(__ds_scope, { ScoreBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ScoreBar.jsx", error: String((e && e.message) || e) }); }

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

// components/core/Trend.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Trend({
  current,
  previous,
  style,
  ...rest
}) {
  const cur = parseInt(current, 10);
  const prev = parseInt(previous, 10);
  if (isNaN(cur) || isNaN(prev)) return null;
  const diff = Math.abs(cur - prev);
  const pts = diff ? ` (${diff} pt${diff > 1 ? "s" : ""})` : "";
  let color, arrow, label;
  if (cur < prev) {
    color = "var(--grade-b)";
    arrow = "▲";
    label = "Improving";
  } else if (cur > prev) {
    color = "var(--grade-c)";
    arrow = "▼";
    label = "Declining";
  } else {
    color = "var(--text-secondary)";
    arrow = "▬";
    label = "No change";
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontSize: "12px",
      fontWeight: "var(--weight-semibold)",
      marginTop: "6px",
      color,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "11px"
    }
  }, arrow), " ", label, pts, " since previous inspection");
}
Object.assign(__ds_scope, { Trend });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Trend.jsx", error: String((e && e.message) || e) }); }

// components/core/ViolationsList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ViolationsList({
  violations = [],
  style,
  ...rest
}) {
  if (!violations.length) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        fontSize: "12px",
        color: "var(--text-secondary)",
        marginTop: "8px",
        fontFamily: "var(--font-sans)",
        ...style
      }
    }, rest), "\u2713 No violations at last inspection");
  }
  const crits = violations.filter(v => v.flag === "Critical").length;
  const label = `${violations.length} violation${violations.length > 1 ? "s" : ""}${crits ? ` · ${crits} critical` : ""}`;
  const sorted = violations.slice().sort(a => a.flag === "Critical" ? -1 : 1);
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      marginTop: "8px",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(!open),
    style: {
      all: "unset",
      display: "block",
      fontSize: "12px",
      color: "var(--text-secondary)",
      cursor: "pointer",
      padding: "2px 0",
      userSelect: "none"
    }
  }, open ? "▾" : "▸", "\xA0\xA0", label), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "6px"
    }
  }, sorted.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: "6px 0",
      borderTop: "1px solid var(--border-default)"
    }
  }, v.flag === "Critical" || v.flag === "Not Critical" ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      fontSize: "10px",
      fontWeight: "var(--weight-semibold)",
      padding: "1px 6px",
      borderRadius: "4px",
      marginBottom: "3px",
      background: v.flag === "Critical" ? "rgba(201,111,32,.15)" : "var(--border-default)",
      color: v.flag === "Critical" ? "var(--grade-c)" : "var(--text-secondary)"
    }
  }, v.flag) : null, v.code ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "10px",
      color: "var(--text-tertiary)",
      fontFamily: "var(--font-mono)",
      marginLeft: "4px"
    }
  }, v.code) : null, v.category ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "10px",
      color: "var(--text-secondary)",
      marginLeft: "6px"
    }
  }, v.category) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      color: "var(--text-primary)",
      lineHeight: 1.45
    }
  }, v.desc)))) : null);
}
Object.assign(__ds_scope, { ViolationsList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ViolationsList.jsx", error: String((e && e.message) || e) }); }

// components/core/ResultCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const GRADE_CONTEXT = {
  A: "Cleanest tier (0–13 points). About 9 in 10 NYC restaurants earn an A.",
  B: "Some violations found (14–27 points) — not necessarily unsafe.",
  C: "28+ points: multiple or more serious violations at this inspection."
};
const PENDING_CONTEXT = "A grade is issued after a graded cycle inspection; a below-A result is re-inspected (often within about 30 days) before a letter is posted.";
function ResultCard({
  grade,
  name = "Unknown",
  address,
  score,
  gradedDate,
  inspectedDate,
  inspectionType,
  pending = false,
  meta = [],
  freshness,
  overdue = false,
  showContext = false,
  violations,
  history,
  closedDate,
  style,
  ...rest
}) {
  const g = pending ? null : grade;
  const metaParts = [];
  if (freshness) {
    metaParts.push(/*#__PURE__*/React.createElement("span", {
      key: "fresh",
      style: overdue ? {
        color: "var(--grade-c)",
        fontWeight: "var(--weight-semibold)"
      } : null
    }, freshness));
  }
  for (let i = 0; i < meta.length; i++) metaParts.push(/*#__PURE__*/React.createElement("span", {
    key: i
  }, meta[i]));
  const prevScore = history && history.length > 1 ? history[1].score : null;
  const curScore = history && history.length > 1 ? history[0].score : null;
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    style: {
      marginTop: "var(--space-6)",
      ...style
    }
  }, rest), closedDate ? /*#__PURE__*/React.createElement(__ds_scope.ClosureBanner, {
    date: closedDate
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "12px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.GradeBadge, {
    grade: g || "?"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
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
  }, address) : null, metaParts.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-small)",
      color: "var(--text-secondary)",
      marginTop: "3px",
      display: "flex",
      flexWrap: "wrap",
      gap: "0 4px"
    }
  }, metaParts.map((p, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 ? /*#__PURE__*/React.createElement("span", null, " \xB7 ") : null, p))) : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      marginTop: "10px",
      lineHeight: "var(--leading-snug)",
      color: "var(--text-primary)"
    }
  }, pending ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, "No letter grade on record yet"), score != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)"
    }
  }, " (latest score ", score, ")") : null) : /*#__PURE__*/React.createElement("span", null, "Grade ", /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: "var(--weight-semibold)"
    }
  }, grade), score != null ? /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 score ", score) : null, gradedDate ? /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 graded ", gradedDate) : null)), showContext ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-small)",
      color: "var(--text-secondary)",
      marginTop: "6px",
      lineHeight: 1.45
    }
  }, pending ? PENDING_CONTEXT : GRADE_CONTEXT[String(grade || "").toUpperCase()] || null) : null, score != null ? /*#__PURE__*/React.createElement(__ds_scope.ScoreBar, {
    score: score,
    grade: g
  }) : null, curScore != null && prevScore != null ? /*#__PURE__*/React.createElement(__ds_scope.Trend, {
    current: curScore,
    previous: prevScore
  }) : null, inspectedDate ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      marginTop: "10px",
      color: "var(--text-secondary)"
    }
  }, "Last inspection: ", inspectedDate, inspectionType ? ` · ${inspectionType}` : "") : null, violations !== undefined ? /*#__PURE__*/React.createElement(__ds_scope.ViolationsList, {
    violations: violations
  }) : null, history ? /*#__PURE__*/React.createElement(__ds_scope.InspectionHistory, {
    history: history
  }) : null);
}
Object.assign(__ds_scope, { ResultCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ResultCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grade-lookup/App.jsx
try { (() => {
const {
  useState
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
  cuisine: "Pizza",
  phone: "(212) 555-1234",
  freshness: "Inspected 3 months ago",
  violations: [{
    desc: "Non-food contact surface improperly constructed.",
    flag: "Not Critical",
    code: "10F",
    category: "Facility maintenance"
  }],
  history: [{
    date: "Mar 3, 2025",
    grade: "A",
    score: 12,
    type: "Re-inspection"
  }, {
    date: "Jan 20, 2025",
    grade: "B",
    score: 19,
    type: "Initial"
  }, {
    date: "Feb 12, 2024",
    grade: "A",
    score: 10,
    type: "Initial"
  }]
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
  cuisine: "Japanese",
  phone: "(212) 555-8821",
  freshness: "Inspected 5 months ago",
  violations: [{
    desc: "Food contact surface not properly washed, rinsed and sanitized.",
    flag: "Critical",
    code: "02G",
    category: "Food handling"
  }],
  history: [{
    date: "Jan 14, 2025",
    grade: "A",
    score: 9,
    type: "Initial"
  }, {
    date: "Nov 2, 2023",
    grade: "A",
    score: 11,
    type: "Initial"
  }]
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
  cuisine: "Middle Eastern",
  phone: "(718) 555-0177",
  freshness: "Inspected 4 months ago",
  violations: [{
    desc: "Cold food item held above 41°F.",
    flag: "Critical",
    code: "02B",
    category: "Temperature control"
  }, {
    desc: "Plumbing not properly installed or maintained.",
    flag: "Not Critical",
    code: "10B",
    category: "Facility maintenance"
  }],
  history: [{
    date: "Feb 2, 2025",
    grade: "B",
    score: 19,
    type: "Re-inspection"
  }, {
    date: "Dec 18, 2024",
    score: 31,
    type: "Initial"
  }, {
    date: "Mar 5, 2024",
    grade: "A",
    score: 8,
    type: "Initial"
  }]
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
  cuisine: "Chinese",
  phone: "(718) 555-3402",
  freshness: "Inspected 2 months ago",
  closedDate: "Apr 9, 2025",
  violations: [{
    desc: "Evidence of mice or live mice present in facility's food and/or non-food areas.",
    flag: "Critical",
    code: "04L",
    category: "Pests"
  }, {
    desc: "Hot food item not held at or above 140°F.",
    flag: "Critical",
    code: "02A",
    category: "Temperature control"
  }, {
    desc: "Non-food contact surface improperly constructed.",
    flag: "Not Critical",
    code: "10F",
    category: "Facility maintenance"
  }],
  history: [{
    date: "Apr 9, 2025",
    closed: true,
    score: 41,
    type: "Re-inspection"
  }, {
    date: "Feb 27, 2025",
    grade: "C",
    score: 34,
    type: "Initial"
  }, {
    date: "Jun 11, 2024",
    grade: "B",
    score: 21,
    type: "Re-inspection"
  }]
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
  cuisine: "Coffee/Tea",
  phone: "(718) 555-9090",
  freshness: "Inspected 1 month ago",
  violations: [],
  history: []
}];
const SUGGESTIONS = ["Joe's Pizza", "Oita Sushi", "Mazzat", "Golden Dragon"];
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
  const isName = s => s.length > 1 && /[a-zA-Z]/.test(s) && !/[?=]/.test(s) && !/^https?:\/\//i.test(s);
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
function metaFor(r) {
  const locStr = `${r.building} ${r.street}, ${r.boro} NY ${r.zip}`;
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${r.dba} ${locStr}`);
  const yelpUrl = "https://www.yelp.com/search?find_desc=" + encodeURIComponent(r.dba) + "&find_loc=" + encodeURIComponent(locStr);
  const resyUrl = "https://resy.com/cities/ny/venues?query=" + encodeURIComponent(r.dba);
  const linkStyle = {
    color: "var(--text-secondary)",
    textDecoration: "underline"
  };
  return [/*#__PURE__*/React.createElement("span", {
    key: "cui"
  }, r.cuisine), /*#__PURE__*/React.createElement("a", {
    key: "tel",
    style: linkStyle,
    href: "tel:+1" + r.phone.replace(/\D/g, "")
  }, r.phone), /*#__PURE__*/React.createElement("a", {
    key: "map",
    style: linkStyle,
    href: mapsUrl,
    target: "_blank",
    rel: "noopener"
  }, "Map \u2197"), /*#__PURE__*/React.createElement("a", {
    key: "yelp",
    style: linkStyle,
    href: yelpUrl,
    target: "_blank",
    rel: "noopener"
  }, "Yelp \u2197"), /*#__PURE__*/React.createElement("a", {
    key: "resy",
    style: linkStyle,
    href: resyUrl,
    target: "_blank",
    rel: "noopener"
  }, "Resy \u2197")];
}
function App() {
  const {
    Header,
    SearchPanel,
    Explainer
  } = window.GradeLookupKit;
  const {
    StatusLine,
    ResultCard,
    GradePlacard,
    Chip,
    Button
  } = window.NYCRestaurantGradeDesignSystem_09ad2a;
  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  const [maps, setMaps] = useState("");
  const [status, setStatus] = useState(null);
  const [statusTone, setStatusTone] = useState("default");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  function finishSearch(nm, lc) {
    const res = lookup(nm, lc);
    setLoading(false);
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
    setRecent(prev => [nm.trim().toUpperCase(), ...prev.filter(x => x !== nm.trim().toUpperCase())].slice(0, 4));
  }
  function runSearch(nm = name, lc = loc) {
    if (!nm.trim()) {
      finishSearch(nm, lc);
      return;
    }
    setLoading(true);
    setStatus("Looking up official data…");
    setStatusTone("default");
    setTimeout(() => finishSearch(nm, lc), 420);
  }
  function onMaps(val) {
    setMaps(val);
    if (!val.trim().startsWith("http")) return;
    const nm = nameFromUrl(val.trim());
    if (nm) {
      const place = nm.split(",")[0].trim();
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
  function nearMe() {
    setLoading(true);
    setStatus("Getting your location…");
    setStatusTone("default");
    setTimeout(() => {
      setLoading(false);
      setStatus(`${DATA.length} restaurant(s) within 300 m · nearest first`);
      setResults(DATA);
    }, 600);
  }
  function trySuggestion(s) {
    setName(s);
    setLoc("");
    runSearch(s, "");
  }
  const chips = recent.length ? recent : SUGGESTIONS.map(s => s.toUpperCase());
  const chipsLabel = recent.length ? "Recently searched" : "Try a search";
  const showChips = !loading && results.length === 0;
  const hero = results.length === 1 ? results[0].grade || "PENDING" : null;
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Grade Lookup",
    style: {
      maxWidth: "var(--layout-max)",
      margin: "0 auto",
      padding: "16px 16px 72px"
    }
  }, /*#__PURE__*/React.createElement(Header, null), /*#__PURE__*/React.createElement(SearchPanel, {
    name: name,
    loc: loc,
    maps: maps,
    loading: loading,
    onName: setName,
    onLoc: setLoc,
    onMaps: onMaps,
    onSearch: () => runSearch()
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: nearMe,
    disabled: loading
  }, "\uD83D\uDCCD Graded restaurants near me"), /*#__PURE__*/React.createElement("div", {
    "aria-live": "polite"
  }, status === "__maps_error__" ? /*#__PURE__*/React.createElement(StatusLine, {
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
  }, status) : null), showChips ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: status ? "2px" : "18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-eyebrow)",
      color: "var(--text-tertiary)",
      textTransform: "uppercase",
      letterSpacing: "var(--tracking-eyebrow)",
      margin: "0 2px 8px"
    }
  }, chipsLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "6px",
      flexWrap: "wrap"
    }
  }, chips.map(s => /*#__PURE__*/React.createElement(Chip, {
    key: s,
    onClick: () => trySuggestion(s)
  }, s)))) : null, hero ? /*#__PURE__*/React.createElement("div", {
    className: "enter",
    style: {
      display: "flex",
      justifyContent: "center",
      marginTop: "12px"
    }
  }, /*#__PURE__*/React.createElement(GradePlacard, {
    grade: hero
  })) : null, results.map(r => /*#__PURE__*/React.createElement("div", {
    className: "enter",
    key: r.dba
  }, /*#__PURE__*/React.createElement(ResultCard, {
    grade: r.grade,
    pending: !r.grade,
    name: r.dba,
    address: fmtAddr(r),
    score: r.score,
    gradedDate: r.graded,
    inspectedDate: r.inspected,
    inspectionType: r.type,
    freshness: r.freshness,
    meta: metaFor(r),
    showContext: results.length === 1,
    violations: r.violations,
    history: r.history,
    closedDate: r.closedDate
  }))), /*#__PURE__*/React.createElement(Explainer, null), /*#__PURE__*/React.createElement("footer", {
    style: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "10px 16px",
      fontSize: "var(--text-eyebrow)",
      color: "var(--text-tertiary)",
      background: "var(--surface-page)",
      borderTop: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "v1.24.0"), /*#__PURE__*/React.createElement("span", null, "NYC Open Data \xB7 DOHMH 43nn-pn8j")));
}
window.GradeLookupApp = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grade-lookup/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/grade-lookup/Header.jsx
try { (() => {
function Header() {
  const {
    Logomark
  } = window.NYCRestaurantGradeDesignSystem_09ad2a;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      margin: "10px 0 22px"
    }
  }, /*#__PURE__*/React.createElement(Logomark, {
    size: 34
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-small)",
      color: "var(--text-secondary)",
      lineHeight: "var(--leading-normal)",
      margin: "10px 0 0"
    }
  }, "Official NYC Health Dept data (DOHMH)."));
}
function FieldLabel({
  htmlFor,
  children,
  hint
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "6px",
      fontSize: "var(--text-small)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-secondary)",
      margin: "0 2px 6px"
    }
  }, children, hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--weight-regular)",
      color: "var(--text-tertiary)"
    }
  }, hint) : null);
}
function SearchPanel({
  name,
  loc,
  maps,
  loading,
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, {
    htmlFor: "f-name"
  }, "Restaurant"), /*#__PURE__*/React.createElement(Input, {
    id: "f-name",
    value: name,
    onChange: e => onName(e.target.value),
    onKeyDown: onEnter,
    placeholder: "e.g. Joe's Pizza",
    autoCapitalize: "characters",
    autoComplete: "off"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, {
    htmlFor: "f-loc",
    hint: "optional \xB7 street, borough, or ZIP \u2014 not neighborhood"
  }, "Location"), /*#__PURE__*/React.createElement(Input, {
    id: "f-loc",
    value: loc,
    onChange: e => onLoc(e.target.value),
    onKeyDown: onEnter,
    placeholder: "e.g. Carmine St, Manhattan, or 10014",
    autoCapitalize: "words",
    autoComplete: "off"
  })), /*#__PURE__*/React.createElement(Divider, {
    label: "or paste a link",
    style: {
      margin: "2px 0 -2px"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Input, {
    variant: "accent",
    value: maps,
    onChange: e => onMaps(e.target.value),
    placeholder: "Paste a Google Maps link\u2026",
    autoComplete: "off",
    autoCapitalize: "none",
    "aria-label": "Google Maps link"
  })), /*#__PURE__*/React.createElement(Button, {
    onClick: onSearch,
    disabled: loading,
    style: {
      marginTop: "2px"
    }
  }, loading ? "Looking up…" : "Look up grade"));
}
function Explainer() {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "18px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(!open),
    style: {
      all: "unset",
      display: "block",
      fontSize: "var(--text-body)",
      color: "var(--text-secondary)",
      cursor: "pointer",
      padding: "4px 0",
      userSelect: "none"
    }
  }, open ? "\u25BE" : "\u25B8", "\xA0\xA0What do these grades mean?"), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-body)",
      color: "var(--text-secondary)",
      lineHeight: 1.55,
      marginTop: "4px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0"
    }
  }, "Grades reflect points for health-code violations found at inspection \u2014 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-primary)",
      fontWeight: "var(--weight-semibold)"
    }
  }, "lower is better"), ". A\xA0=\xA00\u201313\xA0points, B\xA0=\xA014\u201327, C\xA0=\xA028 or more."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0"
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-primary)",
      fontWeight: "var(--weight-semibold)"
    }
  }, "Critical"), " violations (pests, unsafe food temperatures, bare-hand contact) carry more points than upkeep issues."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0"
    }
  }, "About ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-primary)",
      fontWeight: "var(--weight-semibold)"
    }
  }, "9 in 10"), " NYC restaurants score an A, so a B or C is genuinely worth noting \u2014 and an A right at 13 points is borderline.")) : null);
}
window.GradeLookupKit = {
  Header,
  SearchPanel,
  FieldLabel,
  Explainer
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/grade-lookup/Header.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ClosureBanner = __ds_scope.ClosureBanner;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.GradeBadge = __ds_scope.GradeBadge;

__ds_ns.GradePlacard = __ds_scope.GradePlacard;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.InspectionHistory = __ds_scope.InspectionHistory;

__ds_ns.Logomark = __ds_scope.Logomark;

__ds_ns.ResultCard = __ds_scope.ResultCard;

__ds_ns.ScoreBar = __ds_scope.ScoreBar;

__ds_ns.StatusLine = __ds_scope.StatusLine;

__ds_ns.Trend = __ds_scope.Trend;

__ds_ns.ViolationsList = __ds_scope.ViolationsList;

})();
