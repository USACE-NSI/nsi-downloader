import { useConnect } from "redux-bundler-hook";
import { InfoItem } from "../info-item";
import { DAMCAT_COLORS } from "../../../styles/structure-styles/damcat-styles";
import { ColorCollection } from "./discrete/color-collection";
import { Dropdown } from "../dropdown";
import { structureStyles } from "../../../styles/nsi-style-selector";

export function PropertyDisplay({ header, size = "" }) {
  const {
    infoSelectedProperty,
    doInfoChangeSelectedProperty,
    doClusterChangeStyle,
    doNsiChangeStyle,
  } = useConnect(
    "selectInfoSelectedProperty",
    "doInfoChangeSelectedProperty",
    "doClusterChangeStyle",
    "doNsiChangeStyle"
  );
  const CHOICES = {
    st_damcat: {
      Component: ColorCollection,
      props: { colorMap: DAMCAT_COLORS },
    },
    val_struct: {
      Component: ColorCollection,
      props: {
        colorMap: {
          other1: "#000",
          other2: "#ef2",
          other3: "#2e4e35",
          other4: "#09f5fe",
          other5: "#000",
          other6: "#ef2",
          other7: "#2e4e35",
          other8: "#09f5fe",
        },
      },
    },
  };
  const handleChange = (e) => {
    doInfoChangeSelectedProperty(e.target.value);
    doClusterChangeStyle(e.target.value);
    doNsiChangeStyle(e.target.value);
  };
  const { Component, props } = CHOICES[infoSelectedProperty];
  return (
    <InfoItem
      header={header}
      optional={
        <Dropdown
          items={structureStyles}
          defaultValue={infoSelectedProperty}
          onChange={handleChange}
        />
      }
      size={size}
    >
      <Component {...props}></Component>
    </InfoItem>
  );
}
