import Map from "./app-components/map.jsx";
import Dropdown from "./app-components/dropdown.jsx";
import { useConnect } from "redux-bundler-hook";
import { useEffect } from "react";

function App() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#252525]">
      <Map></Map>
      <Dropdown></Dropdown>
    </div>
  );
}

export default App;
