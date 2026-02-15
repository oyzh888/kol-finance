import { getOpinionsWithKOLs, getAvailableDates } from "@/lib/data";
import { Header } from "@/components/Header";
import { OpinionCard } from "@/components/OpinionCard";
import { SentimentGauge } from "@/components/SentimentGauge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dates = await getAvailableDates();
  const today = dates[0] || new Date().toISOString().split("T")[0];
  const opinions = await getOpinionsWithKOLs(today);

  const bearish = opinions.filter((o) => o.sentiment === "bearish");
  const bullish = opinions.filter((o) => o.sentiment === "bullish");

  return (
    <div className="min-h-screen bg-background">
      <Header currentAsset="BTC $69,800" />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        {/* Date label */}
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              KOL Opinions
            </h1>
            <p className="text-sm text-muted">
              {today} &middot; {opinions.length} opinions from{" "}
              {new Set(opinions.map((o) => o.kolId)).size} KOLs
            </p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto sm:gap-2">
            {dates.slice(0, 5).map((d) => (
              <span
                key={d}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  d === today
                    ? "bg-white/10 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {d.slice(5)}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile: Sentiment gauge on top */}
        <div className="mb-4 lg:hidden">
          <SentimentGauge opinions={opinions} />
        </div>

        {/* Three column layout on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
          {/* Bearish column */}
          <div className="lg:col-span-4">
            <div className="mb-3 flex items-center gap-2 sm:mb-4">
              <div className="h-3 w-3 rounded-full bg-bearish" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bearish">
                Bearish ({bearish.length})
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4">
              {bearish.map((op) => (
                <OpinionCard key={op.id} opinion={op} />
              ))}
              {bearish.length === 0 && (
                <p className="rounded-xl border border-white/5 bg-surface p-6 text-center text-sm text-muted">
                  No bearish opinions today
                </p>
              )}
            </div>
          </div>

          {/* Bullish column */}
          <div className="lg:col-span-4">
            <div className="mb-3 flex items-center gap-2 sm:mb-4">
              <div className="h-3 w-3 rounded-full bg-bullish" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bullish">
                Bullish ({bullish.length})
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4">
              {bullish.map((op) => (
                <OpinionCard key={op.id} opinion={op} />
              ))}
              {bullish.length === 0 && (
                <p className="rounded-xl border border-white/5 bg-surface p-6 text-center text-sm text-muted">
                  No bullish opinions today
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - hidden on mobile (shown at top instead) */}
          <div className="hidden lg:col-span-4 lg:block">
            <SentimentGauge opinions={opinions} />

            {/* Top KOLs */}
            <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Top KOLs Today
              </h3>
              <div className="flex flex-col gap-3">
                {opinions
                  .sort((a, b) => b.kol.credibility - a.kol.credibility)
                  .slice(0, 6)
                  .map((op) => (
                    <a
                      key={op.id}
                      href={op.kol.twitterUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] items-center justify-between rounded-lg px-2 py-1 transition-colors hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            op.sentiment === "bearish"
                              ? "bg-bearish/20 text-bearish"
                              : "bg-bullish/20 text-bullish"
                          }`}
                        >
                          {op.kol.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-foreground">
                              {op.kol.name}
                            </span>
                            {op.kol.verified && (
                              <span className="text-[10px] text-blue-400">&#10003;</span>
                            )}
                          </div>
                          {op.kol.followers && (
                            <span className="text-[10px] text-muted">
                              {op.kol.followers}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {op.marketResult && (
                          <span
                            className={`text-xs font-mono ${
                              op.marketResult.priceChange.startsWith("+")
                                ? "text-bullish"
                                : "text-bearish"
                            }`}
                          >
                            {op.marketResult.priceChange}
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium ${
                            op.sentiment === "bearish"
                              ? "text-bearish"
                              : "text-bullish"
                          }`}
                        >
                          {op.sentiment === "bearish" ? "BEAR" : "BULL"}
                        </span>
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
