import React from "react";
import { useConnect } from "redux-bundler-hook";
import { Paper, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import PublicIcon from "@mui/icons-material/Public";
import { BASEMAP_CONFIG } from "../app-bundles/map-bundle";

const BASEMAP_ICONS = {
  osm: MapIcon,
  usgs: SatelliteAltIcon,
  naip: AgricultureIcon,
  sentinel: PublicIcon,
};

export default function BasemapSwitcher() {
  const { mapBasemap, doSetMapBasemap } = useConnect(
    "selectMapBasemap",
    "doSetMapBasemap",
  );

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 10,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <ToggleButtonGroup
        size="small"
        exclusive
        value={mapBasemap}
        onChange={(_, value) => {
          if (value) doSetMapBasemap(value);
        }}
        aria-label="basemap selection"
      >
        {Object.entries(BASEMAP_CONFIG).map(([key, cfg]) => {
          const Icon = BASEMAP_ICONS[key];
          return (
            <ToggleButton
              key={key}
              value={key}
              aria-label={`${cfg.label} basemap`}
            >
              <Tooltip title={cfg.description}>
                {Icon ? <Icon fontSize="small" /> : <span>{cfg.label}</span>}
              </Tooltip>
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Paper>
  );
}