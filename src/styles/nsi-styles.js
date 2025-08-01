import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";

const COLORS = {
  RES: "#2E86DE",
  PUB: "#E74C3C",
  COM: "#27AE60",
  IND: "#F39C12",
};

const styleCache = {};

export function nsiStyle(feature) {
  const color = COLORS[feature.get("st_damcat") || "#000000"];
  if (!styleCache[color]) {
    styleCache[color] = new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: color }),
        stroke: new Stroke({ color: "#fff", width: 1 }),
      }),
    });
  }
  return styleCache[color];
}
