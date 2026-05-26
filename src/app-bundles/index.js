import { composeBundles } from "redux-bundler";
import { createUrlBundle, createCacheBundle } from "redux-bundler";
import cache from "../cache.js";
import mapBundle from "./map-bundle.js";
import nsiBundle from "./nsi-bundle.js";
import drawBundle from "./draw-bundle.js";
import sidePanelBundle from "./side-panel-bundle.js";
import stylesBundle from "./styles-bundle.js";

export default composeBundles(
  createUrlBundle(),
  createCacheBundle({ cacheFn: cache.set }),
  mapBundle,
  drawBundle,
  nsiBundle,
  sidePanelBundle,
  stylesBundle
);
