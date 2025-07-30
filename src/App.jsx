import "./styles/App.css";
import Map from "./app-components/map.jsx";
import { useConnect } from "redux-bundler-hook";
import { useEffect } from "react";

function App() {
  const { hostname, testCount, doTestIncrement, doTestReset } = useConnect(
    "selectHostname",
    "selectTestCount",
    "doTestIncrement",
    "doTestReset"
  );
  useEffect(() => {}, []);

  return (
    <>
      <Map></Map>
    </>
  );
}

export default App;
