import { useConnect } from "redux-bundler-hook";
import { useEffect, useRef, useState } from "react";
import "ol/ol.css";

export function Map() {
  const { doMapInitialize, doNsiLoadShapezip } = useConnect(
    "doMapInitialize",
    "doNsiLoadShapezip",
  );
  const el = useRef();
  // Drag events fire per child element, so count enters/leaves to avoid flicker.
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!el.current) return undefined;
    doMapInitialize(el.current);
  }, [el.current]);

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
    </div>
  );
}
