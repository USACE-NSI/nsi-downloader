import { useConnect } from "redux-bundler-hook";
import { FaDownload } from "react-icons/fa6";
import { Button } from "@usace/groundwork";

export function DownloadGeoJSONButton({ filename = "data.geojson" }) {
  const { nsiFeatureCount, doNsiDownload } = useConnect(
    "selectNsiFeatureCount",
    "doNsiDownload",
  );

  return (
    <Button
      onClick={() => doNsiDownload(filename)}
      disabled={!nsiFeatureCount}
      color="green"
      size="sm"
    >
      <FaDownload />
      <span>Download GeoJSON</span>
    </Button>
  );
}
