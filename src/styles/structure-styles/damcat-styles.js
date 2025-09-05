import { makeClusterStyler, mostFrequent } from "../cluster-style-factory";

export const INITIAL_DAMCAT_COLORS = {
  RES: "#2E86DE",
  PUB: "#E74C3C",
  COM: "#27AE60",
  IND: "#F39C12",
};

// right now this only uses the inital colors, but can be setup to use custom user colors in the future
function damcatPointStyle(damcat) {
  return INITIAL_DAMCAT_COLORS[damcat];
}

function damcatClusterStyle(damcats) {
  return INITIAL_DAMCAT_COLORS[mostFrequent(damcats)];
}

export const damcatStyleFunction = makeClusterStyler({
  property: "st_damcat",
  colorForValue: damcatPointStyle,
  colorForCluster: damcatClusterStyle,
});
