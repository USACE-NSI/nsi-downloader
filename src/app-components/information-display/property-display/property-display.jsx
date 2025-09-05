import { useConnect } from "redux-bundler-hook";
import { InfoItem } from "../info-item";
import { ColorCollection } from "./discrete/color-collection";
import { ColorLegend } from "./continuous/color-legend";
import { Dropdown } from "../dropdown";
import { structureStyles } from "../../../styles/nsi-style-selector";

export function PropertyDisplay({ header, size = "" }) {
  const {
    infoSelectedProperty,
    doInfoChangeSelectedProperty,
    doClusterChangeStyle,
    doNsiChangeStyle,
    stylesDamcatColors,
    doUpdateStyle,
  } = useConnect(
    "selectInfoSelectedProperty",
    "doInfoChangeSelectedProperty",
    "doClusterChangeStyle",
    "doNsiChangeStyle",
    "selectStylesDamcatColors",
    "doUpdateStyle"
  );
  const CHOICES = {
    st_damcat: {
      Component: ColorCollection,
      props: { colorMap: stylesDamcatColors },
    },
    val_struct: {
      Component: ColorLegend,
      props: {
        min: 0,
        max: 100000,
        partitions: 5,
        prefix: "$",
      },
    },
  };
  const handleChange = (e) => {
    doInfoChangeSelectedProperty(e.target.value);
    doClusterChangeStyle(e.target.value);
    doNsiChangeStyle(e.target.value);
    // doUpdateStyle(e.target.value, {
    //   RES: "#2E86DE",
    //   PUB: "#2E86DE",
    //   COM: "#2E86DE",
    //   IND: "#2E86DE",
    // });
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
