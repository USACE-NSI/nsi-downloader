import { useConnect } from "redux-bundler-hook";
import { useEffect, useRef } from "react";
import "ol/ol.css";

function Map() {
  const { doMapInitialize } = useConnect("doMapInitialize");
  const el = useRef();
  useEffect(() => {
    if (!el.current) return undefined;
    doMapInitialize(el.current);
  }, [el.current]);
  return <div ref={el} className="w-full h-[70vh]"></div>;
}

export default Map;
