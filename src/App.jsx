import Map from "./app-components/map.jsx";
import Dropdown from "./app-components/property-selector.jsx";
import { useConnect } from "redux-bundler-hook";
import { useEffect } from "react";

function App() {
  return (
    <div className="flex flex-col">
      <Map></Map>
      <Dropdown></Dropdown>
    </div>
  );
}

export default App;
