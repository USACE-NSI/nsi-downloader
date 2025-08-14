import { damcatStyleFunction } from "./structure-styles/damcat-styles";
import {
  updateValStruct,
  valstructStyleFunction,
} from "./structure-styles/valstruct-styles";

export function getNewStyle(source, newProperty) {
  switch (newProperty) {
    case "st_damcat":
      return damcatStyleFunction;
    case "val_struct":
      updateValStruct(source);
      return valstructStyleFunction;
    default:
      return damcatStyleFunction;
  }
}

export const structureStyles = ["st_damcat", "val_struct"];
