import { DownloadGeoJSONButton } from "./download-button.jsx";

export function SidePanel() {
  return (
    <div className="h-full overflow-y-auto p-3 bg-[#1A1A1A] text-white">
      <h2 className="text-base font-semibold mb-3">NSI Download</h2>
      <div className="flex flex-col gap-3">
        <DownloadGeoJSONButton />
        <div className="h-24 bg-blue-500 rounded-md" />
      </div>
    </div>
  );
}
