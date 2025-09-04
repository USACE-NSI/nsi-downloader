import { useConnect } from "redux-bundler-hook";
import { InfoItem } from "../info-item";
import { DAMCAT_COLORS } from "../../../styles/structure-styles/damcat-styles";
import { ColorCollection } from "./discrete/color-collection";

export function PropertyDisplay({ header, size = "" }) {
  const { infoSelectedProperty } = useConnect("selectInfoSelectedProperty");
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

  const { Component, props } = CHOICES[infoSelectedProperty];
  return (
    <InfoItem header={header} size={size}>
      <Component {...props}></Component>
    </InfoItem>
  );
}
