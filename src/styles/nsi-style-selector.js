import { damcatStyleFunction } from "./structure-styles/damcat-styles";
import { makeClusterStyler } from "./cluster-style-factory";

import { getLegendAndAssigner, validateSource } from "./color-legend-helpers";

export function getNewStyle(source, newProperty) {
  switch (newProperty) {
    case "st_damcat":
      return [
        damcatStyleFunction,
        {
          RES: "#2E86DE",
          PUB: "#E74C3C",
          COM: "#27AE60",
          IND: "#F39C12",
        },
      ];
    case "val_struct":
      if (validateSource(source)) {
        const [legend, assigner] = getLegendAndAssigner(source, newProperty);
        const styleFunction = makeClusterStyler({
          property: "val_struct",
          colorForValue: (valstruct) => assigner(valstruct),
          colorForCluster: () => "#ee01ee",
        });
        return [styleFunction, legend];
      }
    default:
      return [damcatStyleFunction, null];
  }
}

export const structureStyles = ["st_damcat", "val_struct"];
