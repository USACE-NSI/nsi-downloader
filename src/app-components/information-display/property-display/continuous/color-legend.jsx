export function ColorLegend({ colorMap, prefix = null, suffix = null }) {
  console.log(colorMap);
  if (!colorMap) return <div></div>;
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
      {ranges.map(({ lower, upper, color }) => (
        <div
          key={upper}
          className="flex flex-1 items-center justify-center text-white text-xs p-1"
          style={{
            backgroundColor: color,
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
