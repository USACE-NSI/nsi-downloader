import "./styles/App.css";
import Map from "./app-components/map.jsx";
import { useConnect } from "redux-bundler-hook";
import { useEffect } from "react";

function App() {
  return (
    <>
      <Map></Map>
    </>
  );
}

export default App;
