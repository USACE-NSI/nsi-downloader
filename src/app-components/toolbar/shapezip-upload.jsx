import { ToolbarButton } from "./query-toolbar";
import { useRef } from "react";
import { useConnect } from "redux-bundler-hook";

export function ShapezipUpload() {
  const { doNsiLoadShapezip } = useConnect("doNsiLoadShapezip");
  const fileInputRef = useRef(null);

  const handleShapefileSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so picking the same file again re-fires onChange
    if (file) doNsiLoadShapezip(file);
  };

  return (
    <>
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        title="Upload a zipped polygon shapefile (.zip)"
        variant="primary"
      >
        Upload Shapezip
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleShapefileSelected}
        className="hidden"
      />
    </>
  );
}
