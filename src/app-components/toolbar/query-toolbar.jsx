import { useEffect } from "react";
import { useConnect } from "redux-bundler-hook";
import { Button } from "@usace/groundwork";
import { ShapezipUpload } from "./shapezip-upload";

// Map our toolbar variants onto Groundwork's filled Button colors. Filled
// colors are solid bg + white text, which read well on the dark toolbar.
const VARIANT_COLOR = {
  default: "zinc",
  primary: "blue",
  danger: "red",
  mock: "zinc",
};

export function ToolbarButton({
  onClick,
  disabled,
  title,
  variant = "default",
  children,
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      title={title}
      color={VARIANT_COLOR[variant] ?? "zinc"}
      size="sm"
    >
      {children}
    </Button>
  );
}

function ModeTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs font-medium transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-transparent text-gray-400 hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

export function QueryToolbar() {
  const {
    nsiBbox,
    nsiQueryType,
    nsiFips,
    drawDrawing,
    drawVisible,
    nsiLoading,
    nsiLoadError,
    sidePanelComputing,
    doDrawStart,
    doDrawStop,
    doDrawClear,
    doDrawSetVisible,
    doNsiSetQueryType,
    doNsiSetFips,
    doNsiClear,
    doNsiRefresh,
  } = useConnect(
    "selectNsiBbox",
    "selectNsiQueryType",
    "selectNsiFips",
    "selectDrawDrawing",
    "selectDrawVisible",
    "selectNsiLoading",
    "selectNsiLoadError",
    "selectSidePanelComputing",
    "doDrawStart",
    "doDrawStop",
    "doDrawClear",
    "doDrawSetVisible",
    "doNsiSetQueryType",
    "doNsiSetFips",
    "doNsiClear",
    "doNsiRefresh",
  );

  // Let Escape cancel an in-progress draw (discards the sketch, keeps committed
  // polygons). Only listen while actually drawing.
  useEffect(() => {
    if (!drawDrawing) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") doDrawStop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawDrawing, doDrawStop]);

  const isFips = nsiQueryType === "fips";
  const hasQuery = isFips ? nsiFips.trim().length > 0 : nsiBbox.length > 0;
  const status = nsiLoading
    ? "Fetching features…"
    : sidePanelComputing
      ? "Computing stats…"
      : null;

  const runQuery = () => {
    if (hasQuery && !nsiLoading) doNsiRefresh();
  };

  const clearQuery = () => {
    if (isFips) {
      doNsiSetFips("");
      doNsiClear();
    } else {
      doDrawClear();
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#222] border-b border-gray-700">
      <div className="flex rounded overflow-hidden border border-gray-600 mr-1">
        <ModeTab
          active={!isFips}
          onClick={() => doNsiSetQueryType("polygon")}
        >
          Polygon
        </ModeTab>
        <ModeTab active={isFips} onClick={() => doNsiSetQueryType("fips")}>
          FIPS
        </ModeTab>
      </div>
      {isFips ? (
        <input
          type="text"
          value={nsiFips}
          onChange={(e) => doNsiSetFips(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runQuery()}
          placeholder="FIPS code (e.g. 06, 06075, 06075012405)"
          title="FIPS code: state (2), county (5), tract (11), block group (12), or block (15) digits"
          className="px-2 py-1.5 rounded text-sm bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none w-72"
        />
      ) : (
        <>
          <ToolbarButton
            onClick={() => doDrawStart()}
            disabled={drawDrawing}
            variant="primary"
            title="Draw a polygon on the map to define the query area"
          >
            {drawDrawing ? "Drawing…" : "Draw Polygon"}
          </ToolbarButton>
          {drawDrawing && (
            <ToolbarButton
              onClick={() => doDrawStop()}
              variant="danger"
              title="Discard the polygon you're drawing (Esc) — keeps existing query areas"
            >
              Cancel
            </ToolbarButton>
          )}
          <ShapezipUpload />
          <label
            className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none"
            title="Show or hide the drawn query polygons on the map"
          >
            <input
              type="checkbox"
              checked={drawVisible}
              onChange={(e) => doDrawSetVisible(e.target.checked)}
              className="accent-blue-500"
            />
            Show query area
          </label>
        </>
      )}
      <div className="flex-1" />
      {status && (
        <span className="flex items-center gap-2 text-xs text-blue-300">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-blue-300 border-t-transparent animate-spin" />
          {status}
        </span>
      )}
      {!status && nsiLoadError && (
        <span className="text-xs text-red-400">{nsiLoadError}</span>
      )}
      {!status && !nsiLoadError && !isFips && hasQuery && (
        <span className="text-xs text-gray-500 font-mono truncate max-w-[24ch]">
          {nsiBbox[0]}
        </span>
      )}
      <ToolbarButton
        onClick={runQuery}
        disabled={!hasQuery || nsiLoading}
        variant="primary"
        title={
          isFips
            ? "Run the NSI query for the entered FIPS code"
            : "Run the NSI query for the current polygon(s)"
        }
      >
        Query
      </ToolbarButton>
      <ToolbarButton
        onClick={clearQuery}
        disabled={!hasQuery && !drawDrawing}
        variant="danger"
        title={
          isFips
            ? "Clear the FIPS code and loaded features"
            : "Clear the current query and drawn polygon"
        }
      >
        Clear
      </ToolbarButton>
    </div>
  );
}
