"use client";

import { OpinionWithKOL } from "@/lib/types";

const SOURCE_ICONS: Record<string, string> = {
  twitter: "𝕏",
  blog: "B",
  youtube: "YT",
  interview: "TV",
  newsletter: "NL",
};

export function OpinionCard({ opinion }: { opinion: OpinionWithKOL }) {
  const isBearish = opinion.sentiment === "bearish";
  const borderColor = isBearish ? "border-border-bearish" : "border-border-bullish";
  const bgColor = isBearish ? "bg-card-bearish" : "bg-card-bullish";
  const accentColor = isBearish ? "text-bearish" : "text-bullish";
  const pulseClass = isBearish ? "card-bearish" : "card-bullish";

  const timeAgo = getTimeAgo(opinion.publishedAt);
  const mr = opinion.marketResult;
  const eng = opinion.engagement;

  return (
    <div
      className={`${bgColor} ${borderColor} ${pulseClass} rounded-xl border p-4 sm:p-5 transition-all`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <a
            href={opinion.kol.twitterUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isBearish ? "bg-bearish/20 text-bearish" : "bg-bullish/20 text-bullish"
            } text-xs font-bold`}
          >
            {opinion.kol.avatar}
          </a>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <a
                href={opinion.kol.twitterUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm font-semibold text-foreground"
              >
                {opinion.kol.name}
              </a>
              {opinion.kol.verified && (
                <span className="shrink-0 text-blue-400" title="Verified">
                  &#10003;
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className="truncate">{opinion.kol.handle}</span>
              {opinion.kol.followers && (
                <span className="shrink-0">&middot; {opinion.kol.followers}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-xs text-muted">{timeAgo}</span>
          {opinion.sourceType && (
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted">
              {SOURCE_ICONS[opinion.sourceType] || opinion.sourceType}
            </span>
          )}
        </div>
      </div>

      {/* Market Result Badge */}
      {mr && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
          <span className="text-xs text-muted">Since post:</span>
          <span
            className={`text-sm font-bold font-mono ${
              mr.priceChange.startsWith("+") ? "text-bullish" : "text-bearish"
            }`}
          >
            {mr.priceChange}
          </span>
          <span className="text-xs text-muted">
            ${mr.priceAtPost.toLocaleString()} &rarr; ${mr.currentPrice.toLocaleString()}
          </span>
          {mr.outcome !== "pending" && (
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                mr.outcome === "correct"
                  ? "bg-bullish/20 text-bullish"
                  : mr.outcome === "incorrect"
                    ? "bg-bearish/20 text-bearish"
                    : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {mr.outcome.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Confidence bar */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-white/5">
          <div
            className={`h-full rounded-full ${isBearish ? "bg-bearish" : "bg-bullish"}`}
            style={{ width: `${opinion.confidence * 10}%` }}
          />
        </div>
        <span className={`text-xs font-mono ${accentColor}`}>
          {opinion.confidence}/10
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-[15px] font-semibold leading-snug text-foreground sm:text-base">
        {opinion.title}
      </h3>

      {/* Target price */}
      {opinion.targetPrice && (
        <div className="mb-2 text-xs text-muted">
          Target: <span className={`font-medium ${accentColor}`}>${opinion.targetPrice.toLocaleString()}</span>
          {opinion.timeframe && <span> by {opinion.timeframe}</span>}
        </div>
      )}

      {/* Content */}
      <p className="mb-3 text-sm leading-relaxed text-zinc-400 line-clamp-3">
        {opinion.content}
      </p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {opinion.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-md px-2 py-0.5 text-xs ${
              isBearish ? "bg-bearish/10 text-bearish/80" : "bg-bullish/10 text-bullish/80"
            }`}
          >
            {tag}
          </span>
        ))}
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            isBearish ? "bg-bearish/20 text-bearish" : "bg-bullish/20 text-bullish"
          }`}
        >
          ${opinion.asset}
        </span>
        {opinion.category && (
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted">
            {opinion.category}
          </span>
        )}
      </div>

      {/* Footer: engagement + source link */}
      <div className="flex items-center justify-between gap-2">
        {eng && (
          <div className="flex items-center gap-3 text-xs text-muted">
            {eng.likes && <span>{formatNum(eng.likes)} likes</span>}
            {eng.retweets && <span>{formatNum(eng.retweets)} RT</span>}
            {eng.replies && <span>{formatNum(eng.replies)} replies</span>}
          </div>
        )}
        <a
          href={opinion.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`ml-auto flex min-h-[44px] items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isBearish
              ? "bg-bearish/15 text-bearish hover:bg-bearish/25"
              : "bg-bullish/15 text-bullish hover:bg-bullish/25"
          }`}
        >
          &#26597;&#30475;&#21407;&#25991; &rarr;
        </a>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
