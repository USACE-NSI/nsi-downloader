import { InfoItem } from "./info-item.jsx";
import { PropertyDisplay } from "./property-display/property-display.jsx";
import Dropdown from "./dropdown.jsx";
import { DiscreteColor } from "./property-display/discrete/discrete-color.jsx";
import { DAMCAT_COLORS } from "../../styles/structure-styles/damcat-styles.js";
import { useConnect } from "redux-bundler-hook";

function InfoRow() {
  const { infoNumStructures, infoSelectedProperty } = useConnect(
    "selectInfoNumStructures",
    "selectInfoSelectedProperty"
  );

  return (
    <div className="flex gap-2 h-48 m-2 p-2 border border-gray-400 rounded-md">
      <InfoItem header="Information">
        <div className="text-sm">Number of Structues: </div>
        <div className="text-sm">{infoNumStructures}</div>
      </InfoItem>
      <InfoItem header="Select Display Property">
        <Dropdown></Dropdown>
      </InfoItem>
      <PropertyDisplay header={infoSelectedProperty} size="flex-1" />
    </div>
  );
}

export default InfoRow;
