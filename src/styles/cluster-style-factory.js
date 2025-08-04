import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";

const COLORS = {
  RES: "#2E86DE",
  PUB: "#E74C3C",
  COM: "#27AE60",
  IND: "#F39C12",
};

function majorityType(features) {
  const counts = {};
  features.forEach((f) => {
    const t = f.get("st_damcat") || "other";
    counts[t] = (counts[t] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]; // return most frequent color in a cluster
}

const styleCache = {};

export function pointStyle(feature) {}

export function clusterStyle(feature) {
  const members = feature.get("features");
  const color = COLORS[majorityType(members)] || "#000000";
  const radius = members.length === 1 ? 10 : Math.min(9 + members.length, 30);
  const styleKey = `${color}_${radius}_${members.length}`;
  if (!styleCache[styleKey]) {
    styleCache[styleKey] = new Style({
      image: new CircleStyle({
        radius,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: "#fff", width: 1 }),
      }),
      text: new Text({
        text: String(members.length),
        font: "12px sans-serif",
        fill: new Fill({ color: "#fff" }),
        stroke: new Stroke({ color: "#000", width: 2 }),
      }),
    });
  }
  return styleCache[styleKey];
}
