import { useConnect } from "redux-bundler-hook";
import { InfoItem } from "../info-item";
import { ColorCollection } from "./discrete/color-collection";
import { ColorLegend } from "./continuous/color-legend";
import { Dropdown } from "../dropdown";
import { structureProperties } from "../../../styles/nsi-style-selector";
import { useEffect } from "react";

export function PropertyDisplay({ header, size = "" }) {
  const {
    infoSelectedProperty,
    doStylesUpdatePrefix,
    doStylesUpdateSuffix,
    doInfoChangeSelectedProperty,
    doClusterChangeStyle,
    doNsiChangeStyle,
    stylesDamcatColors,
    stylesValstructMap,
    stylesNumstoryMap,
  } = useConnect(
    "selectInfoSelectedProperty",
    "doStylesUpdatePrefix",
    "doStylesUpdateSuffix",
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
    const prop = structureProperties[e.target.value];
    doInfoChangeSelectedProperty(prop);
    doClusterChangeStyle(prop);
    doNsiChangeStyle(prop);
  };
  const { Component, props } = CHOICES[infoSelectedProperty];
  useEffect(() => {
    doStylesUpdatePrefix(props.prefix ?? "");
    doStylesUpdateSuffix(props.suffix ?? "");
  }, [infoSelectedProperty]);

  return (
    <InfoItem
      header={header}
      optional={
        <Dropdown
          items={Object.keys(structureProperties)}
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
