import { useConnect } from "redux-bundler-hook";
import { StatsDisplay } from "./stats-display.jsx";
import { FeatureDetails } from "./feature-details.jsx";

export function SidePanel() {
  const {
    sidePanelPropertyNames,
    sidePanelSelectedProperty,
    doSidePanelSelectProperty,
    nsiLoading,
  } = useConnect(
    "selectSidePanelPropertyNames",
    "selectSidePanelSelectedProperty",
    "doSidePanelSelectProperty",
    "selectNsiLoading",
  );

  const hasProperties = sidePanelPropertyNames.length > 0;
  const placeholder = nsiLoading
    ? "Loading…"
    : "Run a query to load properties";

  return (
    <div className="h-full overflow-y-auto p-3 bg-[#fcfafa] text-gray-900">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="property-select" className="text-sm">
            Property
          </label>
          <select
            id="property-select"
            value={sidePanelSelectedProperty ?? ""}
            onChange={(e) => doSidePanelSelectProperty(e.target.value)}
            disabled={!hasProperties}
            className="p-2 rounded-md bg-white text-gray-900 text-sm border border-gray-300 disabled:opacity-50"
          >
            {!hasProperties && <option value="">{placeholder}</option>}
            {sidePanelPropertyNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <StatsDisplay />
        <FeatureDetails />
      </div>
    </div>
  );
}
