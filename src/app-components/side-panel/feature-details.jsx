import { useConnect } from "redux-bundler-hook";
import { CollapsibleSection } from "./collapsible-section.jsx";

function formatValue(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return v.toLocaleString();
    return v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return String(v);
}

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
  const keys = Object.keys(selectionProperties).sort();

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
              <span className="text-gray-600">{key}</span>
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
