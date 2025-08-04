import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";

export function makeClusterStyler(opts) {
  const {
    property,
    colorForValue: colorForValue,
    colorForCluster = (values) =>
      colorForValue(
        mostFrequent(values) // default = majority colour
      ),
    radiusForSize = (size) => (size === 1 ? 10 : Math.min(9 + size, 25)),
    labelSingle = false,
  } = opts;

  const cache = {}; // key => Style

  return function style(feature) {
    // ----------------------------------------------------------------
    // 1. Unwrap single points / clusters
    // ----------------------------------------------------------------
    const members = feature.get("features") || [feature];
    const size = members.length;

    // ----------------------------------------------------------------
    // 2. Decide colour
    // ----------------------------------------------------------------
    const colour =
      size === 1
        ? colorForValue(members[0].get(property))
        : colorForCluster(members.map((f) => f.get(property)));

    // ----------------------------------------------------------------
    // 3. Decide radius & label
    // ----------------------------------------------------------------
    const radius = radiusForSize(size);
    const text = size > 1 || labelSingle ? String(size) : "";

    // ----------------------------------------------------------------
    // 4. Cache key
    // ----------------------------------------------------------------
    const key = `${colour}_${radius}_${text}`;

    // ----------------------------------------------------------------
    // 5. Build style if needed
    // ----------------------------------------------------------------
    if (!cache[key]) {
      cache[key] = new Style({
        image: new CircleStyle({
          radius,
          fill: new Fill({ color: colour }),
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

/* helper ------------------------------------------------------------*/
function mostFrequent(arr) {
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
