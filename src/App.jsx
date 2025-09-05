import { Map } from "./app-components/map.jsx";
import { InfoRow } from "./app-components/information-display/info-row.jsx";
import { InfoItem } from "./app-components/information-display/info-item.jsx";
import { PropertyDisplay } from "./app-components/information-display/property-display/property-display.jsx";
import { useConnect } from "redux-bundler-hook";

function App() {
  const { infoNumStructures } = useConnect("selectInfoNumStructures");
  return (
    <div className="flex flex-col gap-2 p-2 min-h-screen w-full bg-[#1A1A1A]">
      <Map></Map>
      <InfoRow>
        <InfoItem header="Information">
          <div className="text-sm">Number of Structues: </div>
          <div className="text-sm">{infoNumStructures}</div>
        </InfoItem>
        <PropertyDisplay header="Select Display Property: " size="flex-1" />
        <InfoItem header="Download" size="w-32" />
      </InfoRow>
    </div>
  );
}

export default App;
