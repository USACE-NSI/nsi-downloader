import { useConnect } from "redux-bundler-hook";
import { useEffect, useRef } from "react";
import "ol/ol.css";

export function Map() {
  const { doMapInitialize } = useConnect("doMapInitialize");
  const el = useRef();
  useEffect(() => {
    if (!el.current) return undefined;
    doMapInitialize(el.current);
  }, [el.current]);
  return (
    <div className="relative h-full w-full">
      <div ref={el} className="absolute inset-0" />
    </div>
  );
}
