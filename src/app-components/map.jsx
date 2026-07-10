import { useConnect } from "redux-bundler-hook";
import { useEffect, useRef, useState } from "react";
import Overlay from "ol/Overlay";
import "ol/ol.css";

export function Map() {
  const {
    mapMap,
    doMapInitialize,
    doNsiLoadShapezip,
    nsiClickInfo,
    nsiClickLoading,
    doNsiSetFips,
    doNsiClearClick,
    doNsiRefresh,
  } = useConnect(
    "selectMapMap",
    "doMapInitialize",
    "doNsiLoadShapezip",
    "selectNsiClickInfo",
    "selectNsiClickLoading",
    "doNsiSetFips",
    "doNsiClearClick",
    "doNsiRefresh",
  );
  const el = useRef();
  const popupRef = useRef();
  const overlayRef = useRef();
  // Drag events fire per child element, so count enters/leaves to avoid flicker
  // useRef instead of useState because we do not want to cause rerenders when this changes
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!el.current) return undefined;
    doMapInitialize(el.current);
  }, [el.current]);

  // Anchor the click popup to the map once both exist. stopEvent keeps clicks
  // inside the popup from re-triggering the map's singleclick handler.
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

  // Move the popup to the clicked coordinate, or hide it when there is none.
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.setPosition(nsiClickInfo?.coordinate);
    }
  }, [nsiClickInfo]);

  const pickFips = (code) => {
    // Fill the FIPS box, dismiss the popup, and run the query in one click.
    // doNsiSetFips dispatches synchronously, so doNsiRefresh reads the new code.
    doNsiSetFips(code);
    doNsiClearClick();
    doNsiRefresh();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    // entering a new element
    dragDepth.current += 1;
    setDragging(true);
  };
  const handleDragLeave = () => {
    // leaving current element
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
      onDragOver={(e) => e.preventDefault()} // required to allow a drop
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div ref={el} className="absolute inset-0" />
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-blue-400 bg-blue-500/10">
          <span className="rounded-md bg-blue-600/90 px-4 py-2 text-sm font-medium text-white">
            Drop a zipped shapefile (.zip) to add a query area
          </span>
        </div>
      )}
      <div ref={popupRef}>
        {nsiClickInfo && (
          <div className="min-w-[190px] overflow-hidden rounded-md border border-gray-600 bg-[#222] text-xs text-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-700 bg-[#2a2a2a] px-2 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-gray-400">
                Select area
              </span>
              <button
                onClick={() => doNsiClearClick()}
                className="text-gray-400 hover:text-white"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
            {nsiClickLoading ? (
              <div className="px-3 py-2 text-gray-400">Looking up…</div>
            ) : (
              <div className="py-1">
                {[
                  {
                    label: "State",
                    name: nsiClickInfo.stateName,
                    code: nsiClickInfo.stateFips,
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
                  .map((o) => (
                    <button
                      key={o.label}
                      onClick={() => pickFips(o.code)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-gray-700"
                    >
                      <span>
                        <span className="text-gray-400">{o.label}: </span>
                        {o.name ?? ""}
                      </span>
                      <span className="font-mono text-gray-400">{o.code}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
