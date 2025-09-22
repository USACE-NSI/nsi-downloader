import { useConnect } from "redux-bundler-hook";
import { FaDownload } from "react-icons/fa6";

export function DownloadGeoJSONButton({ filename = "data.geojson" }) {
  const { nsiGeojson } = useConnect("selectNsiGeojson");

  const handleDownload = async () => {
    try {
      if (!nsiGeojson) return;

      const blob = new Blob([JSON.stringify(nsiGeojson, null, 2)], {
        type: "application/geo+json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Could not download GeoJSON.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="p-2 rounded-md bg-gray-700 hover:ring-1 transition"
    >
      <FaDownload></FaDownload>
    </button>
  );
}
