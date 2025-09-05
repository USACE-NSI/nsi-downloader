import { damcatStyleFunction } from "./structure-styles/damcat-styles";
import { makeClusterStyler } from "./cluster-style-factory";

import { getMapAndAssigner, validateSource } from "./color-legend-helpers";

export function getNewStyle(source, newProperty) {
  switch (newProperty) {
    case "st_damcat":
      return damcatStyleFunction;
    case "val_struct":
      if (validateSource(source)) {
        const [map, assigner] = getMapAndAssigner(source, newProperty);
        const styleFunction = makeClusterStyler({
          property: "val_struct",
          colorForValue: (valstruct) => assigner(valstruct),
          colorForCluster: () => "#ee01ee",
        });
        return styleFunction;
      }
    default:
      return damcatStyleFunction;
  }
}

export const structureStyles = ["st_damcat", "val_struct"];
