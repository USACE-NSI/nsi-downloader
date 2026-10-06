// Display names for the NSI attribute fields the API returns.
//
// Keys are the raw db field names, exactly as they arrive as GeoJSON
// properties. Those raw names stay canonical: they key the stats and colour
// scheme state, and they are what the downloaded GeoJSON carries. This map is
// presentation only, so the raw name is shown alongside as a tooltip wherever a
// label replaces it.
//
// Covers the nsi2022 (30 fields) and nsi2026 (42 fields) schemas. Fields the
// API adds later fall through to prettify() rather than showing as identifiers.
export const PROPERTY_LABELS = {
  // Identity and provenance
  fd_id: "Feature ID",
  bid: "Building ID",
  usastrucid: "USA Structures ID",
  cbfips: "Census Block FIPS",
  source: "Data Source",
  ftprntid: "Footprint ID",
  ftprntsrc: "Footprint Source",

  // Location
  x: "Longitude",
  y: "Latitude",
  firmzone: "FIRM Flood Zone",
  zone_sub: "Flood Zone Subcategory",
  static_bfe: "Static Base Flood Elevation",
  pctlowclr: "Percent Low Clearance",
  ground_elv: "Ground Elevation (ft)",
  ground_elv_meters: "Ground Elevation (m)",
  grnd_elv_m: "Ground Elevation (m)",

  // Structure characteristics
  occtype: "Occupancy Type",
  bldgtype: "Building Type",
  st_damcat: "State Damage Category",
  med_yr_blt: "Median Year Built",
  num_story: "Number of Stories",
  bldheight: "Building Height",
  found_type: "Foundation Type",
  found_ht: "Foundation Height",
  sqft: "Total Floor Area (sq ft)",
  ftprntsqft: "Footprint Area (sq ft)",

  // Values
  val_struct: "Structure Value ($)",
  val_cont: "Contents Value ($)",
  val_vehic: "Vehicle Value ($)",
  fullrep: "Full Replacement Value ($)",

  // Occupancy and population
  resunits: "Residential Units",
  students: "Students",
  pop2amo65: "Population 2 AM Over 65",
  pop2amu65: "Population 2 AM Under 65",
  pop2pmo65: "Population 2 PM Over 65",
  pop2pmu65: "Population 2 PM Under 65",
  o65disable: "Occupants 65+ with Disabilities",
  u65disable: "Occupants Under 65 with Disabilities",

  // Vehicles
  vehperunit: "Vehicles per Unit",
  novehprob: "Vehicles Probable",

  // Indices
  depindex: "Dependency Index",
  creprcnt: "CRE Percentage",
  crerank: "CRE Rank",
};

// Unmapped fields still need to read as words, not identifiers:
// "some_field" => "Some Field".
function prettify(field) {
  return field
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function propertyLabel(field) {
  if (field === null || field === undefined) return "";
  const name = String(field);
  return PROPERTY_LABELS[name.toLowerCase()] ?? prettify(name);
}

// Property lists are scanned by eye, so order them by what they display,
// not by the db field name they are keyed on.
export function compareByLabel(a, b) {
  return propertyLabel(a).localeCompare(propertyLabel(b));
}
