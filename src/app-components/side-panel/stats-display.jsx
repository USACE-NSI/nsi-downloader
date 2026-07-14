import { useConnect } from "redux-bundler-hook";

function formatNumber(n) {
  if (!Number.isFinite(n)) return "—";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function ColorDot({ color, size = 12 }) {
  return (
    <span
      className="inline-block rounded-full shrink-0 border border-black/40"
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900 font-mono">{value}</span>
    </div>
  );
}

function GradientRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-gray-600">
        <ColorDot color={color} />
        {label}
      </span>
      <span className="text-gray-900 font-mono">{value}</span>
    </div>
  );
}

function NumericStats({ stats, scheme }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <StatRow label="Count" value={formatNumber(stats.count)} />
        <StatRow label="Min" value={formatNumber(stats.min)} />
        <StatRow label="Max" value={formatNumber(stats.max)} />
        <StatRow label="Mean" value={formatNumber(stats.mean)} />
        <StatRow label="Median" value={formatNumber(stats.median)} />
      </div>
      {scheme?.gradientStops && (
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600">Gradient</span>
            {scheme.scaleLabel && (
              <span className="text-xs text-gray-500 italic">
                {scheme.scaleLabel}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5 pl-1 pr-1">
            {scheme.gradientStops.map(({ label, color, value }) => (
              <GradientRow
                key={label}
                color={color}
                label={label}
                value={formatNumber(value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StringStats({ stats, scheme }) {
  const sorted = [...stats.options].sort((a, b) => b.count - a.count);
  const colorFor = scheme?.colorFor;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <StatRow label="Count" value={formatNumber(stats.count)} />
        <StatRow label="Unique" value={formatNumber(stats.unique)} />
        <StatRow
          label="Mode"
          value={`${stats.mode} (${formatNumber(stats.modeCount)})`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm text-gray-600">Values</div>
        <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto pr-3 pl-1 scrollbar-dark">
          {sorted.map(({ value, count }) => (
            <div
              key={value}
              className="flex items-center justify-between gap-2 text-xs font-mono"
            >
              <span className="flex items-center gap-2 truncate">
                {colorFor && <ColorDot color={colorFor(value)} size={10} />}
                <span className="truncate">{value}</span>
              </span>
              <span className="text-gray-600">{formatNumber(count)}</span>
            </div>
          ))}
        </div>
        {scheme?.hasOverflow && (
          <div className="text-xs text-gray-500 italic pl-3">
            Categories beyond the palette share the fallback color.
          </div>
        )}
      </div>
    </div>
  );
}

export function StatsDisplay() {
  const {
    sidePanelStats,
    sidePanelSelectedProperty,
    sidePanelComputing,
    stylesScheme,
  } = useConnect(
    "selectSidePanelStats",
    "selectSidePanelSelectedProperty",
    "selectSidePanelComputing",
    "selectStylesScheme",
  );

  if (!sidePanelSelectedProperty) return null;
  const stats = sidePanelStats[sidePanelSelectedProperty];

  if (!stats) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md bg-white border border-gray-300 text-sm text-gray-600 italic">
        <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
        {sidePanelComputing ? "Computing stats…" : "Waiting…"}
      </div>
    );
  }

  const scheme =
    stylesScheme && stylesScheme.property === sidePanelSelectedProperty
      ? stylesScheme
      : null;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-md bg-white border border-gray-300">
      {stats.kind === "numeric" && (
        <NumericStats stats={stats} scheme={scheme} />
      )}
      {stats.kind === "string" && <StringStats stats={stats} scheme={scheme} />}
      {stats.kind === "empty" && (
        <div className="text-sm text-gray-600 italic">No values</div>
      )}
    </div>
  );
}
