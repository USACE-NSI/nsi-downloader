import { useConnect } from "redux-bundler-hook";

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
    <div className="flex flex-col gap-2 p-3 rounded-md bg-gray-800/60">
      <div className="flex items-baseline justify-between">
        <div className="text-sm text-gray-400">Feature</div>
        <button
          onClick={doSelectionClear}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          clear
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {keys.map((key) => {
          const isHighlighted = key === sidePanelSelectedProperty;
          return (
            <div
              key={key}
              className={`flex justify-between gap-2 text-xs px-2 py-0.5 rounded ${
                isHighlighted ? "bg-white/10" : ""
              }`}
            >
              <span className="text-gray-400">{key}</span>
              <span className="text-white font-mono truncate">
                {formatValue(selectionProperties[key])}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
