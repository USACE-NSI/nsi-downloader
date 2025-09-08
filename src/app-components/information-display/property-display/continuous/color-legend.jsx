import { useEffect } from "react";
import { useConnect } from "redux-bundler-hook";

// these properties are discrete numerical values (e.g. number of stories)
// if the ranges are one unit (e.g. 1-2), we want to just display the upper bound to avoid confusion
const DISCRETE_RANGE_PROPERTIES = ["num_story"];

export function ColorLegend({ colorMap, prefix = "", suffix = "" }) {
  const { infoSelectedProperty } = useConnect("selectInfoSelectedProperty");
  if (!colorMap) return <div>-</div>; // just display a hyphen if there is no data to create a legend off of

  const map = colorMap.map;
  const min = colorMap.min;
  const max = colorMap.max;

  const sortedUppers = Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b);

  const ranges = sortedUppers.map((upper, i) => {
    const lower = i === 0 ? min : sortedUppers[i - 1];
    const color = map[upper];
    return { lower, upper, color };
  });

  return (
    <div className="flex w-full rounded-md overflow-hidden min-h-12">
      {ranges.map(({ lower, upper, color }) => {
        console.log(lower, upper);
        const isSingle = upper - lower <= 1 && max - min <= 8;
        DISCRETE_RANGE_PROPERTIES.includes(infoSelectedProperty);

        return (
          <div
            key={upper}
            className="flex-1 flex items-center justify-center text-white text-xs p-1"
            style={{ backgroundColor: color }}
          >
            {isSingle ? ( // if the range is <= 1, we only want to display the upper bound
              <>
                {prefix}
                {upper.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                {suffix}
              </>
            ) : (
              <>
                {prefix}
                {lower.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                {suffix}
                &nbsp;–&nbsp;
                {prefix}
                {upper.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                {suffix}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
