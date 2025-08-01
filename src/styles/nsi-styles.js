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

export function nsiStyle(feature) {
  const members = feature.get("features");
  console.log(members);
  const domType = majorityType(members);
  const color = COLORS[domType] || "#000000";

  let radius = 10;
  if (members.length > 1) {
    radius = 20;
  }

  if (!styleCache[color]) {
    styleCache[color] = new Style({
      image: new CircleStyle({
        radius: radius,
        fill: new Fill({ color: color }),
        stroke: new Stroke({ color: "#fff", width: 1 }),
      }),
    });
  }
  return styleCache[color];
}
