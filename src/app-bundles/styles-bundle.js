import Style from "ol/style/Style.js";
import Circle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import { actions as sidePanelActions } from "./side-panel-bundle.js";
import { actions as selectionActions } from "./selection-bundle.js";
import { actions as nsiActions } from "./nsi-bundle.js";

const FALLBACK_COLOR = "#888888";
const DISCRETE_PALETTE = [
  "#2d96ff",
  "#09e40f",
  "#fa3232",
  "#ffaa00",
  "#aa00ff",
  "#00bcd4",
  "#ff4081",
  "#8bc34a",
  "#795548",
  "#9c27b0",
];
const MAX_DISCRETE = DISCRETE_PALETTE.length;

const actions = {
  REBUILD_REQUESTED: "STYLES_REBUILD_REQUESTED",
  REBUILT: "STYLES_REBUILT",
};

function parseHex(hex) {
  const s = hex.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

function toHex(rgb) {
  return (
    "#" +
    rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")
  );
}

function lerpColor(a, b, t) {
  const aRgb = parseHex(a);
  const bRgb = parseHex(b);
  return toHex(aRgb.map((c, i) => c + (bRgb[i] - c) * t));
}

// Yellow → orange → red sequential scale (ColorBrewer YlOrRd).
function gradientColor(t) {
  const c = Math.min(1, Math.max(0, t));
  if (c < 0.5) return lerpColor("#ffffcc", "#fd8d3c", c * 2);
  return lerpColor("#fd8d3c", "#bd0026", (c - 0.5) * 2);
}

function symlog(x) {
  return Math.sign(x) * Math.log10(1 + Math.abs(x));
}

function symlogInverse(y) {
  return Math.sign(y) * (Math.pow(10, Math.abs(y)) - 1);
}

// Quantize the gradient into a fixed number of color buckets so the style
// cache in makeStyleFn stays small. Without this, every distinct numeric value
// yields a near-unique hex, defeating the cache (one Style per feature).
const GRADIENT_BUCKETS = 64;

const GRADIENT_STOP_FRACTIONS = [
  { label: "Min", t: 0 },
  { label: "25%", t: 0.25 },
  { label: "50%", t: 0.5 },
  { label: "75%", t: 0.75 },
  { label: "Max", t: 1 },
];

function buildNumericScheme(property, values) {
  const nums = values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const min = nums[0];
  const max = nums[nums.length - 1];
  const lMin = symlog(min);
  const lMax = symlog(max);
  const lRange = lMax - lMin || 1;
  const colorFor = (val) => {
    const v = Number(val);
    if (!Number.isFinite(v)) return FALLBACK_COLOR;
    const t = (symlog(v) - lMin) / lRange;
    const clamped = Math.min(1, Math.max(0, t));
    const bucketed = Math.round(clamped * GRADIENT_BUCKETS) / GRADIENT_BUCKETS;
    return gradientColor(bucketed);
  };
  const gradientStops = GRADIENT_STOP_FRACTIONS.map(({ label, t }) => {
    const value = symlogInverse(lMin + t * lRange);
    return { label, value, color: gradientColor(t) };
  });
  return {
    kind: "numeric",
    property,
    min,
    max,
    fallbackColor: FALLBACK_COLOR,
    colorFor,
    gradientStops,
    scaleLabel: "symlog",
  };
}

function buildStringScheme(property, values) {
  const counts = new Map();
  for (const v of values) {
    const k = String(v);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const colorByValue = new Map();
  sorted.slice(0, MAX_DISCRETE).forEach(([k], i) => {
    colorByValue.set(k, DISCRETE_PALETTE[i]);
  });
  const colorFor = (val) => colorByValue.get(String(val)) ?? FALLBACK_COLOR;
  return {
    kind: "string",
    property,
    colorFor,
    fallbackColor: FALLBACK_COLOR,
    hasOverflow: sorted.length > MAX_DISCRETE,
  };
}

function buildScheme(features, property) {
  const values = features
    .map((f) => f.get(property))
    .filter((v) => v !== null && v !== undefined && v !== "");
  if (values.length === 0) return null;
  const allNumeric = values.every((v) => Number.isFinite(Number(v)));
  return allNumeric
    ? buildNumericScheme(property, values)
    : buildStringScheme(property, values);
}

function makeStyleFn(scheme, selectedId) {
  const stroke = new Stroke({ color: "#000", width: 1 });
  const highlightStroke = new Stroke({ color: "#000000", width: 3 });
  const cache = new Map();
  return (feature) => {
    const isSelected =
      selectedId != null && feature.get("fd_id") === selectedId;
    const color = scheme.colorFor(feature.get(scheme.property));
    const key = isSelected ? `${color}!sel` : color;
    let style = cache.get(key);
    if (!style) {
      style = new Style({
        image: new Circle({
          radius: isSelected ? 7 : 4,
          fill: new Fill({ color }),
          stroke: isSelected ? highlightStroke : stroke,
        }),
        zIndex: isSelected ? 1 : 0,
      });
      cache.set(key, style);
    }
    return style;
  };
}

export default {
  name: "styles",
  getReducer: () => {
    const initialState = {
      _shouldRebuild: false,
      builtProperty: null,
      scheme: null,
      selectionId: null,
    };
    return (state = initialState, { type, payload }) => {
      switch (type) {
        case sidePanelActions.STATS_COMPUTED:
        case sidePanelActions.PROPERTY_SELECTED:
          return { ...state, _shouldRebuild: true };
        case selectionActions.FEATURE_SELECTED:
          return {
            ...state,
            _shouldRebuild: true,
            selectionId: payload?.id ?? null,
          };
        case nsiActions.CLEARED:
          return {
            ...state,
            _shouldRebuild: false,
            builtProperty: null,
            scheme: null,
            selectionId: null,
          };
        case actions.REBUILD_REQUESTED:
        case actions.REBUILT:
          return { ...state, ...payload };
        default:
          return state;
      }
    };
  },
  selectStylesBuiltProperty: (state) => state.styles.builtProperty,
  selectStylesScheme: (state) => state.styles.scheme,
  doStylesRebuild: () => {
    return ({ store, dispatch }) => {
      dispatch({
        type: actions.REBUILD_REQUESTED,
        payload: { _shouldRebuild: false },
      });
      const layer = store.selectNsiLayer();
      const property = store.selectSidePanelSelectedProperty();
      if (!layer || !property) return;
      const features = layer.getSource().getFeatures();
      const scheme = buildScheme(features, property);
      if (!scheme) return;
      const selectionId = store.selectSelectionId();
      layer.setStyle(makeStyleFn(scheme, selectionId));
      dispatch({
        type: actions.REBUILT,
        payload: { builtProperty: property, scheme },
      });
    };
  },
  reactStylesShouldRebuild: (state) => {
    if (state.styles._shouldRebuild)
      return { actionCreator: "doStylesRebuild" };
  },
};
