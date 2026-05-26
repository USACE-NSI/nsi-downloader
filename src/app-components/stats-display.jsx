import { useConnect } from "redux-bundler-hook";

function formatNumber(n) {
  if (!Number.isFinite(n)) return "—";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-mono">{value}</span>
    </div>
  );
}

function NumericStats({ stats }) {
  return (
    <div className="flex flex-col gap-1">
      <StatRow label="Count" value={formatNumber(stats.count)} />
      <StatRow label="Min" value={formatNumber(stats.min)} />
      <StatRow label="Max" value={formatNumber(stats.max)} />
      <StatRow label="Mean" value={formatNumber(stats.mean)} />
      <StatRow label="Median" value={formatNumber(stats.median)} />
    </div>
  );
}

function StringStats({ stats }) {
  const sorted = [...stats.options].sort((a, b) => b.count - a.count);
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
        <div className="text-sm text-gray-400">Values</div>
        <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto pl-3 pr-3">
          {sorted.map(({ value, count }) => (
            <div
              key={value}
              className="flex justify-between gap-2 text-xs font-mono"
            >
              <span className="truncate">{value}</span>
              <span className="text-gray-400">{formatNumber(count)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsDisplay() {
  const { sidePanelStats, sidePanelSelectedProperty } = useConnect(
    "selectSidePanelStats",
    "selectSidePanelSelectedProperty",
  );

  if (!sidePanelSelectedProperty) return null;
  const stats = sidePanelStats[sidePanelSelectedProperty];
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-md bg-gray-800/60">
      {stats.kind === "numeric" && <NumericStats stats={stats} />}
      {stats.kind === "string" && <StringStats stats={stats} />}
      {stats.kind === "empty" && (
        <div className="text-sm text-gray-400 italic">No values</div>
      )}
    </div>
  );
}
