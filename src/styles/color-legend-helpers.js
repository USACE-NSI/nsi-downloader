import Cluster from "ol/source/Cluster";

function getPartitionColorMap(min, max, partitions, startHue = 60, endHue = 0) {
  const width = (max - min) / partitions;
  const out = {};
  for (let i = 1; i <= partitions; i++) {
    const rawUpper = min + width * i;
    const upper = Math.floor(rawUpper);
    const t = i / partitions;
    const hue = startHue + (endHue - startHue) * t;
    const color = `hsl(${hue.toFixed(0)}, 70%, 50%)`;
    out[upper] = color;
  }
  return out;
}

function makeColorAssigner(upperToColor, max) {
  return function colorForValue(v) {
    for (let upper in upperToColor) {
      if (v <= upper) return upperToColor[upper];
    }
    return upperToColor[Math.floor(max)];
  };
}

function getMinMaxFromSource(source, propName) {
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

export function validateSource(source) {
  return !(source.getFeatures().length == 0);
}

export function getLegendAndAssigner(source, property) {
  const [min, max] = getMinMaxFromSource(source, property);
  const map = getPartitionColorMap(min, max, 8);
  const f = makeColorAssigner(map, max);
  return [{ min, max, map }, f];
}
