import { useConnect } from "redux-bundler-hook";
import { ShapezipUpload } from "./shapezip-upload";

export function ToolbarButton({
  onClick,
  disabled,
  title,
  variant = "default",
  children,
}) {
  const base =
    "px-3 py-1.5 rounded text-sm font-medium transition disabled:cursor-not-allowed";
  const variants = {
    default: "bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50",
    primary: "bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-500 disabled:opacity-40",
    mock: "bg-gray-700 text-gray-400 border border-dashed border-gray-500 opacity-70",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export function QueryToolbar() {
  const {
    nsiBbox,
    drawDrawing,
    nsiLoading,
    nsiLoadError,
    sidePanelComputing,
    doDrawStart,
    doDrawClear,
    doNsiRefresh,
  } = useConnect(
    "selectNsiBbox",
    "selectDrawDrawing",
    "selectNsiLoading",
    "selectNsiLoadError",
    "selectSidePanelComputing",
    "doDrawStart",
    "doDrawClear",
    "doNsiRefresh",
  );

  const hasQuery = nsiBbox.length > 0;
  const status = nsiLoading
    ? "Fetching features…"
    : sidePanelComputing
      ? "Computing stats…"
      : null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#222] border-b border-gray-700">
      <span className="text-xs uppercase tracking-wider text-gray-400 mr-1">
        Query
      </span>
      <ToolbarButton
        onClick={() => doDrawStart()}
        disabled={drawDrawing}
        variant="primary"
        title="Draw a polygon on the map to define the query area"
      >
        {drawDrawing ? "Drawing…" : "Draw Polygon"}
      </ToolbarButton>
      <ShapezipUpload />
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
      {!status && !nsiLoadError && hasQuery && (
        <span className="text-xs text-gray-500 font-mono truncate max-w-[24ch]">
          {nsiBbox[0]}
        </span>
      )}
      <ToolbarButton
        onClick={() => doNsiRefresh()}
        disabled={!hasQuery || nsiLoading}
        variant="primary"
        title="Run the NSI query for the current polygon(s)"
      >
        Query
      </ToolbarButton>
      <ToolbarButton
        onClick={() => doDrawClear()}
        disabled={!hasQuery && !drawDrawing}
        variant="danger"
        title="Clear the current query and drawn polygon"
      >
        Clear
      </ToolbarButton>
    </div>
  );
}
