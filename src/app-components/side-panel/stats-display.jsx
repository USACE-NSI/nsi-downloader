import { useConnect } from "redux-bundler-hook";
import { CollapsibleSection } from "./collapsible-section.jsx";
import { formatNumber } from "./format.js";

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900 font-mono">{value}</span>
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
  return (
    <div className="flex flex-col gap-1">
      <StatRow label="Count" value={formatNumber(stats.count)} />
      <StatRow label="Unique" value={formatNumber(stats.unique)} />
      <StatRow
        label="Mode"
        value={`${stats.mode} (${formatNumber(stats.modeCount)})`}
      />
    </div>
  );
}

export function StatsDisplay() {
  const { sidePanelStats, sidePanelSelectedProperty, sidePanelComputing } =
    useConnect(
      "selectSidePanelStats",
      "selectSidePanelSelectedProperty",
      "selectSidePanelComputing",
    );

  if (!sidePanelSelectedProperty) return null;
  const stats = sidePanelStats[sidePanelSelectedProperty];

  if (!stats) {
    return (
      <CollapsibleSection title="Statistics">
        <div className="flex items-center gap-2 text-sm text-gray-600 italic">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
          {sidePanelComputing ? "Computing stats…" : "Waiting…"}
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection title="Statistics">
      {stats.kind === "numeric" && <NumericStats stats={stats} />}
      {stats.kind === "string" && <StringStats stats={stats} />}
      {stats.kind === "empty" && (
        <div className="text-sm text-gray-600 italic">No values</div>
      )}
    </CollapsibleSection>
  );
}
