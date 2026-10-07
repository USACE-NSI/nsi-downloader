export function formatPercent(pct) {
  if (pct >= 10) return `${Math.round(pct)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  return "<1%";
}

export function formatNumber(n) {
  if (!Number.isFinite(n)) return "—";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Shared by the Structure Properties list and the map hover tooltip, so the two
// can't drift on what a missing value looks like.
export function formatValue(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") {
    if (Number.isInteger(v)) return v.toLocaleString();
    return v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return String(v);
}
