import { formatNumber, formatPercent } from "./format.js";

const SIZE = 140;
const R = 60;
const C = SIZE / 2;
// The tail folds into a single "Other" slice rather than growing more wedges:
// past this many, wedges get too thin to compare and the legend reads better.
const MAX_SLICES = 8;

// Wedges run clockwise from 12 o'clock. A full-circle wedge would have no arc
// endpoints, but the <3 slice guard below means one can never occur.
function arcPath(startAngle, endAngle) {
  const x1 = C + R * Math.sin(startAngle);
  const y1 = C - R * Math.cos(startAngle);
  const x2 = C + R * Math.sin(endAngle);
  const y2 = C - R * Math.cos(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${C} ${C}`,
    `L ${x1} ${y1}`,
    `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
    "Z",
  ].join(" ");
}

function buildSlices(options, scheme) {
  const sorted = [...options].sort((a, b) => b.count - a.count);
  if (sorted.length <= MAX_SLICES) {
    return sorted.map(({ value, count }) => ({
      key: value,
      label: value,
      count,
      color: scheme.colorFor(value),
    }));
  }
  const head = sorted.slice(0, MAX_SLICES - 1);
  const tail = sorted.slice(MAX_SLICES - 1);
  return [
    ...head.map(({ value, count }) => ({
      key: value,
      label: value,
      count,
      color: scheme.colorFor(value),
    })),
    {
      key: "__other__",
      label: `Other (${formatNumber(tail.length)} categories)`,
      count: tail.reduce((sum, o) => sum + o.count, 0),
      color: scheme.fallbackColor,
    },
  ];
}

export function CategoryPie({ stats, scheme }) {
  // Two slices is a stat tile, not a pie — the Count/Unique/Mode rows say it better.
  if (stats.options.length < 3) return null;

  const slices = buildSlices(stats.options, scheme);
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  if (total <= 0) return null;

  let angle = 0;
  const wedges = slices.map((slice) => {
    const start = angle;
    const end = start + (slice.count / total) * 2 * Math.PI;
    angle = end;
    return { ...slice, d: arcPath(start, end), pct: (slice.count / total) * 100 };
  });

  // No slice labels: the Legend section is this pie's key and its table view,
  // listing every category with its count and share. Hover gives per-wedge detail.
  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        // Capped: the circle is square, so unbounded width would push the
        // sections below it off-screen. w-full only bites if the panel is
        // dragged narrower than the cap.
        className="w-full max-w-[220px] h-auto"
        role="img"
        aria-label={`Share of features by ${scheme.property}`}
      >
        {wedges.map(({ key, d, color, label, count, pct }) => (
          <path
            key={key}
            d={d}
            fill={color}
            // Load-bearing, not cosmetic: the surface-colored gap is the
            // secondary encoding that keeps adjacent wedges separable under
            // color-vision deficiency, where "Other" grey nears the pink slot.
            stroke="#ffffff"
            strokeWidth="2"
            // Hold the gap at a true 2px as the SVG scales with the panel,
            // rather than letting viewBox units stretch it.
            vectorEffect="non-scaling-stroke"
          >
            <title>{`${label}: ${formatNumber(count)} (${formatPercent(pct)})`}</title>
          </path>
        ))}
      </svg>
    </div>
  );
}
