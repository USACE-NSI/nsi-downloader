import Map from "./app-components/map.jsx";
import Dropdown from "./app-components/information-display/dropdown.jsx";
import { useConnect } from "redux-bundler-hook";
import { useEffect } from "react";

function App() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#252525]">
      <Map></Map>
      <div className="h-48 m-2 border border-blue-50"></div>
      <Dropdown></Dropdown>
    </div>
  );
}

export default App;
