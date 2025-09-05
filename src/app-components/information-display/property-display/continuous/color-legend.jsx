import { getPartitionColorMap } from "../../../../styles/structure-styles/valstruct-styles";

export function ColorLegend({
  colorMap,
  min,
  max,
  partitions,
  prefix = null,
  suffix = null,
}) {
  // 1) Build the map
  const bucketMap = getPartitionColorMap(min, max, partitions);

  // 2) Sort the cut-offs and pair them with their lower bound
  const sortedUppers = Object.keys(bucketMap)
    .map(Number)
    .sort((a, b) => a - b);

  const ranges = sortedUppers.map((upper, i) => {
    const lower = i === 0 ? min : sortedUppers[i - 1];
    const color = bucketMap[upper];
    // percent width of this bucket in the full range
    const pct = ((upper - lower) / (max - min)) * 100;
    return { lower, upper, color, pct };
  });

  // 3) Render a flex‐row of colored boxes + labels
  return (
    <div className="flex w-full rounded-md overflow-hidden min-h-12">
      {ranges.map(({ lower, upper, color, pct }) => (
        <div
          key={upper}
          className="flex items-center justify-center text-white text-xs p-1"
          style={{
            backgroundColor: color,
            flexGrow: pct,
            flexBasis: 0,
          }}
        >
          {prefix}
          {lower.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          {suffix} –{prefix}
          {upper.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          {suffix}
        </div>
      ))}
    </div>
  );
}
