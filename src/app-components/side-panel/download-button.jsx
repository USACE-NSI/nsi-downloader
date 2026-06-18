import { useConnect } from "redux-bundler-hook";
import { FaDownload } from "react-icons/fa6";

export function DownloadGeoJSONButton({ filename = "data.geojson" }) {
  const { nsiFeatureCount, doNsiDownload } = useConnect(
    "selectNsiFeatureCount",
    "doNsiDownload",
  );

  return (
    <button
      onClick={() => doNsiDownload(filename)}
      disabled={!nsiFeatureCount}
      className="flex items-center gap-2 p-2 rounded-md bg-gray-700 text-white disabled:opacity-50 hover:ring-1 transition"
    >
      <FaDownload />
      <span className="text-sm">Download GeoJSON</span>
    </button>
  );
}
