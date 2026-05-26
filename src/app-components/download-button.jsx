import { useState } from "react";
import { useConnect } from "redux-bundler-hook";
import { FaDownload } from "react-icons/fa6";

export function DownloadGeoJSONButton({ filename = "data.geojson" }) {
  const { drawBbox } = useConnect("selectDrawBbox");
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (!drawBbox || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`api/structures?bbox=${drawBbox}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      const geojson = await response.json();
      const blob = new Blob([JSON.stringify(geojson, null, 2)], {
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
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!drawBbox || busy}
      className="flex items-center gap-2 p-2 rounded-md bg-gray-700 text-white disabled:opacity-50 hover:ring-1 transition"
    >
      <FaDownload />
      <span className="text-sm">
        {busy ? "Downloading..." : "Download GeoJSON"}
      </span>
    </button>
  );
}
