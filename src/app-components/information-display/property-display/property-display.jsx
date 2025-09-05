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
    stylesValstructMap,
    stylesNumstoryMap,
  } = useConnect(
    "selectInfoSelectedProperty",
    "doInfoChangeSelectedProperty",
    "doClusterChangeStyle",
    "doNsiChangeStyle",
    "selectStylesDamcatColors",
    "selectStylesValstructMap",
    "selectStylesNumstoryMap"
  );
  const CHOICES = {
    st_damcat: {
      Component: ColorCollection,
      props: { colorMap: stylesDamcatColors },
    },
    val_struct: {
      Component: ColorLegend,
      props: {
        colorMap: stylesValstructMap,
        prefix: "$",
      },
    },
    num_story: {
      Component: ColorLegend,
      props: {
        colorMap: stylesNumstoryMap,
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
