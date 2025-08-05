import {
  makeClusterStyler,
  getMinMaxFromSource,
  mostFrequent,
} from "./cluster-style-factory";
import { scaleSequential } from "d3-scale";
import { interpolateTurbo } from "d3-scale-chromatic";

const DAMCAT_COLORS = {
  RES: "#2E86DE",
  PUB: "#E74C3C",
  COM: "#27AE60",
  IND: "#F39C12",
};

const damcatStyle = makeClusterStyler({
  property: "st_damcat",
  colorForValue: (damcat) => DAMCAT_COLORS[damcat],
});

const structValStyle = (() => {
  return makeClusterStyler({
    property: "val_struct",
    colorForValue: () => DAMCAT_COLORS["RES"],
  });
})();

export function getNewStyle(source, newProperty) {
  switch (newProperty) {
    case "st_damcat":
      return makeClusterStyler({
        property: "st_damcat",
        colorForValue: (damcat) => DAMCAT_COLORS[damcat],
        colorForCluster: (damcats) => DAMCAT_COLORS[mostFrequent(damcats)],
      });
    case "val_struct":
      const [min, max] = getMinMaxFromSource(source, "val_struct");
      const scale = scaleSequential(interpolateTurbo).domain([min, max]);
      function calculateAverage(arr) {
        if (arr.length === 0) return 0; // Handle empty array
        const sum = arr.reduce((acc, num) => acc + num, 0); // Sum all elements
        return sum / arr.length; // Divide by the number of elements
      }
      return makeClusterStyler({
        property: "val_struct",
        colorForValue: (v) => scale(v),
        colorForCluster: (vals) => {
          console.log(scale(400000));
          return scale(400000);
        },
      });
    default:
      return makeClusterStyler({
        property: "val_struct",
        colorForValue: () => DAMCAT_COLORS["PUB"],
      });
  }
}

export const structureStyles = {
  st_damcat: damcatStyle,
  val_struct: structValStyle,
};
