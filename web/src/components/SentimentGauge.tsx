"use client";

import { OpinionWithKOL } from "@/lib/types";

export function SentimentGauge({ opinions }: { opinions: OpinionWithKOL[] }) {
  const bullish = opinions.filter((o) => o.sentiment === "bullish");
  const bearish = opinions.filter((o) => o.sentiment === "bearish");
  const total = opinions.length || 1;
  const bullishPct = Math.round((bullish.length / total) * 100);
  const bearishPct = Math.round((bearish.length / total) * 100);

  const avgBullishConf =
    bullish.length > 0
      ? (
          bullish.reduce((s, o) => s + o.confidence, 0) / bullish.length
        ).toFixed(1)
      : "0";
  const avgBearishConf =
    bearish.length > 0
      ? (
          bearish.reduce((s, o) => s + o.confidence, 0) / bearish.length
        ).toFixed(1)
      : "0";

  const sentiment =
    bullishPct > bearishPct
      ? "Bullish"
      : bearishPct > bullishPct
        ? "Bearish"
        : "Neutral";
  const sentimentColor =
    sentiment === "Bullish"
      ? "text-bullish"
      : sentiment === "Bearish"
        ? "text-bearish"
        : "text-yellow-400";

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
        Sentiment Overview
      </h3>

      {/* Main gauge */}
      <div className="mb-4 text-center">
        <span className={`text-3xl font-bold ${sentimentColor}`}>
          {sentiment}
        </span>
        <p className="mt-1 text-xs text-muted">
          Market consensus from {total} KOL opinions
        </p>
      </div>

      {/* Bar */}
      <div className="mb-4 flex h-3 overflow-hidden rounded-full">
        <div
          className="bg-bearish transition-all"
          style={{ width: `${bearishPct}%` }}
        />
        <div
          className="bg-bullish transition-all"
          style={{ width: `${bullishPct}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-bearish/10 p-3 text-center">
          <div className="text-2xl font-bold text-bearish">{bearish.length}</div>
          <div className="text-xs text-muted">Bearish</div>
          <div className="mt-1 text-xs text-bearish/70">
            Avg conf: {avgBearishConf}/10
          </div>
        </div>
        <div className="rounded-lg bg-bullish/10 p-3 text-center">
          <div className="text-2xl font-bold text-bullish">{bullish.length}</div>
          <div className="text-xs text-muted">Bullish</div>
          <div className="mt-1 text-xs text-bullish/70">
            Avg conf: {avgBullishConf}/10
          </div>
        </div>
      </div>
    </div>
  );
}
