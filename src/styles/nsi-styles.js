import { makeClusterStyler } from "./cluster-style-factory";

const DAMCAT_COLORS = {
  RES: "#2E86DE",
  PUB: "#E74C3C",
  COM: "#27AE60",
  IND: "#F39C12",
};

const redStyle = makeClusterStyler({
  property: "st_damcat",
  colorForValue: () => DAMCAT_COLORS["PUB"],
});
const blueStyle = makeClusterStyler({
  property: "st_damcat",
  colorForValue: () => DAMCAT_COLORS["RES"],
});
const greenStyle = makeClusterStyler({
  property: "st_damcat",
  colorForValue: () => DAMCAT_COLORS["COM"],
});

export const structureStyles = {
  Red: redStyle,
  Blue: blueStyle,
  Green: greenStyle,
};
