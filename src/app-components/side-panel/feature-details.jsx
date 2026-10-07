import { useConnect } from "redux-bundler-hook";
import { compareByLabel, propertyLabel } from "../../property-labels.js";
import { CollapsibleSection } from "./collapsible-section.jsx";
import { formatValue } from "./format.js";

export function FeatureDetails() {
  const {
    selectionProperties,
    sidePanelSelectedProperty,
    doSelectionClear,
  } = useConnect(
    "selectSelectionProperties",
    "selectSidePanelSelectedProperty",
    "doSelectionClear"
  );

  if (!selectionProperties) return null;
  const keys = Object.keys(selectionProperties).sort(compareByLabel);

  return (
    <CollapsibleSection
      title="Structure Properties"
      action={
        <button
          onClick={doSelectionClear}
          className="text-xs text-gray-500 hover:text-gray-800"
        >
          clear
        </button>
      }
    >
      <div className="flex flex-col gap-0.5">
        {keys.map((key) => {
          const isHighlighted = key === sidePanelSelectedProperty;
          return (
            <div
              key={key}
              className={`flex justify-between gap-2 text-xs px-2 py-0.5 rounded ${
                isHighlighted ? "bg-blue-50" : ""
              }`}
            >
              <span className="text-gray-600" title={key}>
                {propertyLabel(key)}
              </span>
              <span className="text-gray-900 font-mono truncate">
                {formatValue(selectionProperties[key])}
              </span>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
