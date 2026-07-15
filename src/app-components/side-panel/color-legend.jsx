import { useConnect } from "redux-bundler-hook";
import { CollapsibleSection } from "./collapsible-section.jsx";
import { formatNumber, formatPercent } from "./format.js";

function ColorDot({ color, size = 12 }) {
  return (
    <span
      className="inline-block rounded-full shrink-0 border border-black/40"
      style={{ width: size, height: size, backgroundColor: color }}
    />
  );
}

function LegendRow({ color, label, value, secondary, size }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-gray-600 truncate">
        <ColorDot color={color} size={size} />
        <span className="truncate">{label}</span>
      </span>
      <span className="flex items-baseline gap-2 shrink-0 font-mono tabular-nums">
        {value !== undefined && <span className="text-gray-900">{value}</span>}
        {secondary !== undefined && (
          <span className="text-gray-500 text-xs w-10 text-right">
            {secondary}
          </span>
        )}
      </span>
    </div>
  );
}

function NumericLegend({ scheme }) {
  return (
    <>
      {scheme.scaleLabel && (
        <div className="text-xs text-gray-500 italic text-right">
          {scheme.scaleLabel} scale
        </div>
      )}
      <div className="flex flex-col gap-0.5 pl-1">
        {scheme.gradientStops.map(({ label, color, value }) => (
          <LegendRow
            key={label}
            color={color}
            label={label}
            value={formatNumber(value)}
          />
        ))}
      </div>
    </>
  );
}

function StringLegend({ scheme, stats }) {
  // Mirror the map: categories the palette covers get their own color, the rest
  // share the fallback. Every category is listed either way — this is the
  // complete table the pie's 8-slice summary defers to.
  const sorted = [...stats.options].sort((a, b) => b.count - a.count);
  const colored = sorted.filter(
    ({ value }) => scheme.colorFor(value) !== scheme.fallbackColor,
  );
  const overflow = sorted.filter(
    ({ value }) => scheme.colorFor(value) === scheme.fallbackColor,
  );
  // Share is of the styled features, so these rows total 100%.
  const total = sorted.reduce((sum, { count }) => sum + count, 0);
  const pctOf = (count) =>
    total > 0 ? formatPercent((count / total) * 100) : "—";

  return (
    <div className="flex flex-col gap-0.5 pl-1 max-h-48 overflow-y-auto pr-1 scrollbar-dark">
      {colored.map(({ value, count }) => (
        <LegendRow
          key={value}
          color={scheme.colorFor(value)}
          label={value}
          value={formatNumber(count)}
          secondary={pctOf(count)}
          size={10}
        />
      ))}
      {overflow.length > 0 && (
        <>
          <div className="text-xs text-gray-500 italic pt-1">
            Beyond the palette — all share the fallback color:
          </div>
          {overflow.map(({ value, count }) => (
            <LegendRow
              key={value}
              color={scheme.fallbackColor}
              label={value}
              value={formatNumber(count)}
              secondary={pctOf(count)}
              size={10}
            />
          ))}
        </>
      )}
    </div>
  );
}

export function ColorLegend() {
  const { sidePanelStats, sidePanelSelectedProperty, stylesScheme } = useConnect(
    "selectSidePanelStats",
    "selectSidePanelSelectedProperty",
    "selectStylesScheme",
  );

  if (!sidePanelSelectedProperty) return null;
  if (!stylesScheme || stylesScheme.property !== sidePanelSelectedProperty)
    return null;

  const stats = sidePanelStats[sidePanelSelectedProperty];

  return (
    <CollapsibleSection title="Legend">
      {stylesScheme.kind === "numeric" && <NumericLegend scheme={stylesScheme} />}
      {stylesScheme.kind === "string" && stats?.kind === "string" && (
        <StringLegend scheme={stylesScheme} stats={stats} />
      )}
    </CollapsibleSection>
  );
}
