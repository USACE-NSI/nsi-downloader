import { composeBundles } from "redux-bundler";
import { createUrlBundle, createCacheBundle } from "redux-bundler";
import cache from "../cache.js";
import mapBundle from "./map-bundle.js";
import nsiBundle from "./nsi-bundle.js";
import drawBundle from "./draw-bundle.js";
import clusterBundle from "./cluster-bundle.js";
import infoBundle from "./information-bundle.js";

export default composeBundles(
  createUrlBundle(),
  createCacheBundle({ cacheFn: cache.set }),
  mapBundle,
  drawBundle,
  nsiBundle,
  clusterBundle,
  infoBundle
);
