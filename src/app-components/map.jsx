import { useConnect } from "redux-bundler-hook";
import { useEffect, useRef, useState } from "react";
import Overlay from "ol/Overlay";
import { getCenter } from "ol/extent";
import BasemapSwitcher from "./basemap-switcher.jsx";
import { propertyLabel } from "../property-labels.js";
import { formatValue } from "./side-panel/format.js";
import "ol/ol.css";

export function Map() {
  const {
    mapMap,
    doMapInitialize,
    doNsiLoadShapezip,
    nsiClickInfo,
    nsiClickLoading,
    nsiLoading,
    selectionHoverFeature,
    sidePanelSelectedProperty,
    drawDrawing,
    doNsiSetFips,
    doNsiClearClick,
    doNsiRefresh,
  } = useConnect(
    "selectMapMap",
    "doMapInitialize",
    "doNsiLoadShapezip",
    "selectNsiClickInfo",
    "selectNsiClickLoading",
    "selectNsiLoading",
    "selectSelectionHoverFeature",
    "selectSidePanelSelectedProperty",
    "selectDrawDrawing",
    "doNsiSetFips",
    "doNsiClearClick",
    "doNsiRefresh",
  );
  const el = useRef();
  const popupRef = useRef();
  const overlayRef = useRef();
  const hoverRef = useRef();
  const hoverOverlayRef = useRef();
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!el.current) return undefined;
    doMapInitialize(el.current);
  }, [el.current]);

  useEffect(() => {
    if (!mapMap || !popupRef.current || overlayRef.current) return;
    const overlay = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      offset: [0, -12],
      stopEvent: true,
    });
    mapMap.addOverlay(overlay);
    overlayRef.current = overlay;
  }, [mapMap]);

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.setPosition(nsiClickInfo?.coordinate);
    }
  }, [nsiClickInfo]);

  useEffect(() => {
    if (!mapMap || !hoverRef.current || hoverOverlayRef.current) return;
    // stopEvent false plus a pointer-events-none wrapper is load-bearing: a
    // tooltip that swallows pointer events cancels the pointermove that produced
    // it, so it flickers itself out the moment it appears.
    // Anchored bottom-center so the box hangs over the marker like the FIPS
    // click popup does: no horizontal offset to occlude a neighbouring point,
    // and the 4px dot stays visible under the 8px gap.
    const overlay = new Overlay({
      element: hoverRef.current,
      positioning: "bottom-center",
      offset: [0, -8],
      stopEvent: false,
    });
    mapMap.addOverlay(overlay);
    hoverOverlayRef.current = overlay;
  }, [mapMap]);

  // Extent centre rather than raw coordinates: NSI structures are points, but
  // this stays correct for whatever geometry the layer holds.
  useEffect(() => {
    if (!hoverOverlayRef.current) return;
    const geometry = selectionHoverFeature?.getGeometry();
    hoverOverlayRef.current.setPosition(
      geometry ? getCenter(geometry.getExtent()) : undefined,
    );
  }, [selectionHoverFeature]);

  const pickFips = (code) => {
    doNsiSetFips(code);
    doNsiClearClick();
    doNsiRefresh();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };
  const handleDragLeave = () => {
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragging(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.name.toLowerCase().endsWith(".zip")) doNsiLoadShapezip(file);
  };

  return (
    <div
      className="relative h-full w-full"
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div ref={el} className="absolute inset-0" />
      <BasemapSwitcher />
      <div ref={popupRef}>
        {nsiClickInfo && (
          <div className="min-w-[190px] overflow-hidden rounded-md border border-gray-300 bg-white text-xs text-gray-900 shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-2 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-gray-600">
                Select area
              </span>
              <button
                onClick={() => doNsiClearClick()}
                className="text-gray-500 hover:text-gray-900"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
            {nsiClickLoading ? (
              <div className="px-3 py-2 text-gray-600">Looking up…</div>
            ) : (
              <div className="py-1">
                {[
                  {
                    label: "State",
                    name: nsiClickInfo.stateName,
                    code: nsiClickInfo.stateFips,
                    disabled: true,
                  },
                  {
                    label: "County",
                    name: nsiClickInfo.countyName,
                    code: nsiClickInfo.countyFips,
                  },
                  { label: "Tract", code: nsiClickInfo.tractFips },
                  { label: "Block group", code: nsiClickInfo.blockGroupFips },
                  { label: "Block", code: nsiClickInfo.blockFips },
                ]
                  .filter((o) => o.code)
                  .map((o) =>
                    o.disabled ? (
                      <div
                        key={o.label}
                        title="State-level FIPS queries are not currently supported"
                        className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left opacity-50 cursor-not-allowed"
                      >
                        <span>
                          <span className="text-gray-600">{o.label}: </span>
                          {o.name ?? ""}
                        </span>
                        <span className="font-mono text-gray-600">
                          {o.code}
                        </span>
                      </div>
                    ) : (
                      <button
                        key={o.label}
                        onClick={() => pickFips(o.code)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-gray-100"
                      >
                        <span>
                          <span className="text-gray-600">{o.label}: </span>
                          {o.name ?? ""}
                        </span>
                        <span className="font-mono text-gray-600">
                          {o.code}
                        </span>
                      </button>
                    ),
                  )}
              </div>
            )}
          </div>
        )}
      </div>
      <div ref={hoverRef} className="pointer-events-none">
        {selectionHoverFeature &&
          sidePanelSelectedProperty &&
          !drawDrawing &&
          !nsiLoading && (
            <div
              // Decorative mirror of the click panel, which stays the accessible
              // path — so no live region, and hidden from the a11y tree here.
              aria-hidden="true"
              className="whitespace-nowrap rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 shadow-lg"
            >
              <span className="text-gray-600">
                {propertyLabel(sidePanelSelectedProperty)}:{" "}
              </span>
              <span className="font-mono">
                {formatValue(
                  selectionHoverFeature.get(sidePanelSelectedProperty),
                )}
              </span>
            </div>
          )}
      </div>
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-blue-400 bg-blue-500/10">
          <span className="rounded-md bg-blue-600/90 px-4 py-2 text-sm font-medium text-white">
            Drop a zipped shapefile (.zip) to add a query area
          </span>
        </div>
      )}
    </div>
  );
}