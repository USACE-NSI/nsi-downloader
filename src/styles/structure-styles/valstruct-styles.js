import Cluster from "ol/source/Cluster";

import {
  getMinMaxFromSource,
  makeClusterStyler,
} from "../cluster-style-factory";

const NUM_BUCKETS = 8;

let [minValStruct, maxValStruct] = [-Infinity, Infinity];
let partitionMap;
let colorForVal;

export function updateValStruct(source) {
  if (source.getFeatures().length == 0 || source instanceof Cluster) {
    return;
  }
  // only compute min, max, buckets once
  const shouldInit =
    !Number.isFinite(minValStruct) && !Number.isFinite(maxValStruct);
  //console.log(shouldInit);

  if (shouldInit) {
    [minValStruct, maxValStruct] = getMinMaxFromSource(source, "val_struct");
    //console.log(minValStruct, maxValStruct);
    partitionMap = getPartitionColorMap(
      minValStruct,
      maxValStruct,
      NUM_BUCKETS
    );
    colorForVal = makeColorAssigner(partitionMap, maxValStruct);
  }
}

export function getPartitionColorMap(
  min,
  max,
  partitions,
  startHue = 60,
  endHue = 0
) {
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
  //console.log(out);
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

function valStructPointStyle(valstruct) {
  return colorForVal(valstruct);
}

function valstructClusterStyle(valstructs) {
  return "#F39C12";
}

export const valstructStyleFunction = makeClusterStyler({
  property: "val_struct",
  colorForValue: valStructPointStyle,
  colorForCluster: valstructClusterStyle,
});
