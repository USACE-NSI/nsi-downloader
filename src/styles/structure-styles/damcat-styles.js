import { makeClusterStyler, mostFrequent } from "../cluster-style-factory";

export const DAMCAT_COLORS = {
  RES: "#2E86DE",
  PUB: "#E74C3C",
  COM: "#27AE60",
  IND: "#F39C12",
};

function damcatPointStyle(damcat) {
  return DAMCAT_COLORS[damcat];
}

function damcatClusterStyle(damcats) {
  return DAMCAT_COLORS[mostFrequent(damcats)];
}

export const damcatStyleFunction = makeClusterStyler({
  property: "st_damcat",
  colorForValue: damcatPointStyle,
  colorForCluster: damcatClusterStyle,
});
