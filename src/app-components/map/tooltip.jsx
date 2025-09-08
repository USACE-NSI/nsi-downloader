import { useConnect } from "redux-bundler-hook";
import { reverseStructurePropertiesLookup } from "../../styles/nsi-style-selector";

export function Tooltip({ text, visible, left, top }) {
  const { infoSelectedProperty, stylesPrefix, stylesSuffix } = useConnect(
    "selectInfoSelectedProperty",
    "selectStylesPrefix",
    "selectStylesSuffix"
  );
  const style = {
    position: "absolute",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    visibility: visible ? "visible" : "hidden",
    left,
    top,
    transform: "translate(-50%, -100%)", // adjust anchor
  };
  return (
    <div className="bg-gray-700 text-white rounded-md p-1" style={style}>
      {reverseStructurePropertiesLookup[infoSelectedProperty]}: {stylesPrefix}
      {text}
      {stylesSuffix}
    </div>
  );
}
