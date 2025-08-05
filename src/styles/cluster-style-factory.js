import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";

export function makeClusterStyler(opts) {
  const {
    property,
    colorForValue,
    colorForCluster,
    radiusForSize = (size) => (size === 1 ? 10 : Math.min(9 + size, 25)),
    labelSingle = false,
  } = opts;

  const cache = {}; // key => Style

  return function style(feature) {
    const members = feature.get("features") || [feature];
    const size = members.length;

    const color =
      size === 1
        ? colorForValue(members[0].get(property))
        : colorForCluster(members.map((f) => f.get(property)));
    const radius = radiusForSize(size);
    const text = size > 1 || labelSingle ? String(size) : "";

    const key = `${color}_${radius}_${text}`;

    if (!cache[key]) {
      cache[key] = new Style({
        image: new CircleStyle({
          radius,
          fill: new Fill({ color: color }),
          stroke: new Stroke({ color: "#fff", width: 1 }),
        }),
        text: text
          ? new Text({
              text,
              font: "bold 12px sans-serif",
              fill: new Fill({ color: "#fff" }),
              stroke: new Stroke({ color: "#000", width: 2 }),
            })
          : undefined,
      });
    }
    return cache[key];
  };
}

export function mostFrequent(arr) {
  const counts = {};
  let bestVal,
    bestCnt = -1;
  arr.forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
    if (counts[v] > bestCnt) {
      bestCnt = counts[v];
      bestVal = v;
    }
  });
  return bestVal;
}

export function getMinMaxFromSource(source, propName) {
  let min = Infinity;
  let max = -Infinity;

  if (source.getState() !== "ready") {
    console.warn("getMinMaxFromSource called before source is ready");
    return [min, max];
  }

  source.getFeatures().forEach((f) => {
    const v = Number(f.get(propName));
    if (!Number.isFinite(v)) return;
    if (v < min) min = v;
    if (v > max) max = v;
  });

  return [min, max];
}
