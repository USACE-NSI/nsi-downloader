import { ToolbarButton } from "./query-toolbar";
import { useRef } from "react";
import { useConnect } from "redux-bundler-hook";
import shp from "shpjs";

export function ShapezipUpload() {
  const { doNsiSetBbox, doDrawShowPolygons } = useConnect(
    "doNsiSetBbox",
    "doDrawShowPolygons",
  );
  const fileInputRef = useRef(null);

  const handleShapefileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so picking the same file again re-fires onChange
    if (!file) return;
    try {
      const geojson = await shp(await file.arrayBuffer());

      const rings = geojson.features.map((feature) => {
        // coordinates[0] represents coordinates for the first polygon in this feature
        // array of [lon, lat] arrays
        const coords = feature.geometry.coordinates[0];
        return coords.map(([lon, lat]) => `${lon},${lat}`).join(",");
      });
      // TODO: validate polygons (turf) -> one NSI request per polygon -> merge by fd_id
      doNsiSetBbox(rings);
      doDrawShowPolygons(geojson);
    } catch (err) {
      console.error("Failed to read shapefile:", err);
    }
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
