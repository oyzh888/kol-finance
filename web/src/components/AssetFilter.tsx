"use client";

import { OpinionWithKOL } from "@/lib/types";

const ALL_ASSETS = ["BTC", "ETH", "SOL", "NVDA", "TSLA", "AAPL", "GOOGL", "SPY", "QQQ", "GLD"];

export function AssetFilter({
  opinions,
  selected,
  onSelect,
}: {
  opinions: OpinionWithKOL[];
  selected: string | null;
  onSelect: (asset: string | null) => void;
}) {
  // Count opinions per asset (an opinion with "BTC + ETH" counts for both)
  const counts = new Map<string, number>();
  for (const op of opinions) {
    const assets = op.asset.split(/\s*\+\s*/);
    for (const a of assets) {
      const key = a.trim().toUpperCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  // Sort: assets with opinions first, then alphabetical
  const sorted = [...ALL_ASSETS].sort((a, b) => {
    const ca = counts.get(a) || 0;
    const cb = counts.get(b) || 0;
    if (ca !== cb) return cb - ca;
    return a.localeCompare(b);
  });

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors min-h-[40px] ${
          selected === null
            ? "bg-white/15 text-foreground"
            : "bg-white/5 text-muted hover:text-foreground hover:bg-white/10"
        }`}
      >
        All
        <span className="ml-1 text-xs opacity-60">{opinions.length}</span>
      </button>
      {sorted.map((asset) => {
        const count = counts.get(asset) || 0;
        const isActive = selected === asset;
        return (
          <button
            key={asset}
            onClick={() => onSelect(isActive ? null : asset)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition-colors min-h-[40px] ${
              isActive
                ? "bg-white/15 text-foreground ring-1 ring-white/20"
                : count > 0
                  ? "bg-white/5 text-foreground/80 hover:bg-white/10"
                  : "bg-white/[0.02] text-muted/40 cursor-default"
            }`}
            disabled={count === 0}
          >
            {asset}
            {count > 0 && (
              <span className={`ml-1 text-xs ${isActive ? "opacity-80" : "opacity-50"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
