import { composeBundles } from "redux-bundler";
import { createUrlBundle, createCacheBundle } from "redux-bundler";
import cache from "../cache.js";
import testBundle from "./test-bundle";
import mapBundle from "./map-bundle.js";
import zebraBundle from "./zebra-bundle.js";
import nsiBundle from "./nsi-bundle.js";
import drawBundle from "./draw-bundle.js";

export default composeBundles(
  createUrlBundle(),
  createCacheBundle({ cacheFn: cache.set }),
  testBundle,
  mapBundle,
  //zebraBundle,
  nsiBundle,
  drawBundle
);
