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
    case "num_story":
      if (validateSource(source)) {
        const [legend, assigner] = getLegendAndAssigner(source, newProperty);
        const styleFunction = makeClusterStyler({
          property: "num_story",
          colorForValue: (e) => assigner(e),
          colorForCluster: () => "#31ee",
        });
        return [styleFunction, legend];
      }
    default:
      return [damcatStyleFunction, null];
  }
}

export const structureProperties = {
  "Damage Category": "st_damcat",
  "Structure Value": "val_struct",
  "Number of Stories": "num_story",
};

export const reverseStructurePropertiesLookup = {
  st_damcat: "Damage Category",
  val_struct: "Structure Value",
  num_story: "Number of Stories",
};
