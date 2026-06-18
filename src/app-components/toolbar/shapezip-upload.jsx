import { ToolbarButton } from "./query-toolbar";
import { useRef } from "react";
import { useConnect } from "redux-bundler-hook";
import shp from "shpjs";

export function ShapezipUpload() {
  const { doNsiAddBbox, doDrawAddPolygons, nsiBbox } = useConnect(
    "doNsiAddBbox",
    "doDrawAddPolygons",
    "selectNsiBbox",
  );
  const fileInputRef = useRef(null);

  const handleShapefileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so picking the same file again re-fires onChange
    if (!file) return;
    try {
      const geojson = await shp(await file.arrayBuffer());

      // skip rings already in bbox so re-uploading the same shapezip is a no-op.
      const newFeatures = [];
      const newRings = [];
      for (const feature of geojson.features) {
        // coordinates[0] is the outer ring: array of [lon, lat]
        const coords = feature.geometry.coordinates[0];
        const ring = coords.map(([lon, lat]) => `${lon},${lat}`).join(",");
        if (nsiBbox.includes(ring) || newRings.includes(ring)) continue;
        newRings.push(ring);
        newFeatures.push(feature);
      }
      if (newRings.length === 0) return;

      // TODO: validate polygons (turf) before adding
      doNsiAddBbox(newRings);
      doDrawAddPolygons({ type: "FeatureCollection", features: newFeatures });
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
