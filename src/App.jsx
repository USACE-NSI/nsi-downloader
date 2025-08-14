import Map from "./app-components/map.jsx";
import Dropdown from "./app-components/information-display/dropdown.jsx";
import InfoRow from "./app-components/information-display/info-row.jsx";
import { useConnect } from "redux-bundler-hook";
import { useEffect } from "react";

function App() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#252525]">
      <Map></Map>
      <InfoRow></InfoRow>
      <Dropdown></Dropdown>
    </div>
  );
}

export default App;
