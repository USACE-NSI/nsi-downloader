import { ToolbarButton } from "./query-toolbar";
import { useRef } from "react";
import shp from "shpjs";

export function ShapezipUpload() {
  const fileInputRef = useRef(null);

  const handleShapefileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so picking the same file again re-fires onChange
    if (!file) return;
    try {
      const geojson = await shp(await file.arrayBuffer());

      // coordinates[0] represents coords for the first polygon in this feature
      // array of [x,y] arrays
      const coords = geojson.features[0].geometry.coordinates[0];

      // TODO: validate polygons (turf) -> one NSI request per polygon -> merge by fd_id
      console.log("Parsed shapefile:", geojson);
      console.log("Coordinates", coords);
    } catch (err) {
      console.error("Failed to read shapefile:", err);
    }
  };

  return (
    <>
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        title="Upload a zipped polygon shapefile (.zip)"
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
