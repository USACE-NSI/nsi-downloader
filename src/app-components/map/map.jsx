import { useConnect } from "redux-bundler-hook";
import { useEffect, useRef } from "react";
import { Tooltip } from "./tooltip";
import "ol/ol.css";

export function Map() {
  const { doMapInitialize, doMapSetTooltip, mapTooltip } = useConnect(
    "doMapInitialize",
    "doMapSetTooltip",
    "selectMapTooltip"
  );
  const el = useRef();
  useEffect(() => {
    if (!el.current) return undefined;
    doMapInitialize(el.current);
    doMapSetTooltip();
  }, [el.current]);
  return (
    <div className="relative h-[70vh] w-full">
      <div ref={el} className="absolute inset-0" />
      <Tooltip
        visible={mapTooltip.visible}
        text={mapTooltip.text.toLocaleString("en-US", {
          maximumFractionDigits: 0,
        })}
        left={mapTooltip.left}
        top={mapTooltip.top}
      />
    </div>
  );
}
