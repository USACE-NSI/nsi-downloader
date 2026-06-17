import { useEffect, useState } from "react";
import { Map } from "./app-components/map.jsx";
import { SidePanel } from "./app-components/side-panel/side-panel.jsx";
import { QueryToolbar } from "./app-components/query-toolbar.jsx";

function App() {
  const [trayWidth, setTrayWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const minWidth = 300;
      const maxWidth = window.innerWidth / 3;
      const newWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
      setTrayWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen w-full bg-[#1A1A1A]">
      <div
        style={{ width: `${trayWidth}px`, position: "relative" }}
        className="flex-none border-r border-gray-700"
      >
        <SidePanel />
        <div
          onMouseDown={() => setIsResizing(true)}
          style={{
            position: "absolute",
            top: 0,
            right: "-4px",
            width: "8px",
            height: "100%",
            cursor: "col-resize",
            zIndex: 10,
            backgroundColor: isResizing ? "#2d96ff" : "transparent",
          }}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <QueryToolbar />
        <div className="flex-1 min-h-0">
          <Map />
        </div>
      </div>
    </div>
  );
}

export default App;
