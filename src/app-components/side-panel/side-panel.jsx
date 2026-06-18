import { useConnect } from "redux-bundler-hook";
import { DownloadGeoJSONButton } from "./download-button.jsx";
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
    "selectNsiLoading"
  );

  const hasProperties = sidePanelPropertyNames.length > 0;
  const placeholder = nsiLoading ? "Loading…" : "Run a query to load properties";

  return (
    <div className="h-full overflow-y-auto p-3 bg-[#1A1A1A] text-white">
      <h2 className="text-base font-semibold mb-3">NSI Download</h2>
      <div className="flex flex-col gap-3">
        <DownloadGeoJSONButton />
        <div className="flex flex-col gap-1">
          <label htmlFor="property-select" className="text-sm">
            Property
          </label>
          <select
            id="property-select"
            value={sidePanelSelectedProperty ?? ""}
            onChange={(e) => doSidePanelSelectProperty(e.target.value)}
            disabled={!hasProperties}
            className="p-2 rounded-md bg-gray-700 text-white text-sm disabled:opacity-50"
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
