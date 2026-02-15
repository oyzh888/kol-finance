"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { KOL } from "@/lib/types";

const inputClass =
  "w-full min-h-[44px] rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted";

export default function AdminPage() {
  const [kols, setKols] = useState<KOL[]>([]);
  const [tab, setTab] = useState<"kols" | "opinions">("opinions");

  // KOL form
  const [kolName, setKolName] = useState("");
  const [kolHandle, setKolHandle] = useState("");
  const [kolBias, setKolBias] = useState<"bullish" | "bearish" | "neutral">("neutral");
  const [kolTags, setKolTags] = useState("");
  const [kolCredibility, setKolCredibility] = useState(50);

  // Opinion form
  const [opKolId, setOpKolId] = useState("");
  const [opTitle, setOpTitle] = useState("");
  const [opContent, setOpContent] = useState("");
  const [opSentiment, setOpSentiment] = useState<"bullish" | "bearish">("bullish");
  const [opAsset, setOpAsset] = useState("BTC");
  const [opConfidence, setOpConfidence] = useState(5);
  const [opTags, setOpTags] = useState("");
  const [opSourceUrl, setOpSourceUrl] = useState("");
  const [opSourceType, setOpSourceType] = useState("twitter");
  const [opPriceAtPost, setOpPriceAtPost] = useState("");
  const [opTargetPrice, setOpTargetPrice] = useState("");
  const [opCategory, setOpCategory] = useState("market-analysis");

  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/kols")
      .then((r) => r.json())
      .then(setKols);
  }, []);

  async function handleAddKOL(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/kols", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: kolName,
        handle: kolHandle,
        bias: kolBias,
        credibility: kolCredibility,
        tags: kolTags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      const kol = await res.json();
      setKols((prev) => [...prev, kol]);
      setKolName("");
      setKolHandle("");
      setKolTags("");
      setKolCredibility(50);
      setStatus("KOL added!");
      setTimeout(() => setStatus(""), 2000);
    }
  }

  async function handleDeleteKOL(id: string) {
    await fetch("/api/kols", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKols((prev) => prev.filter((k) => k.id !== id));
  }

  async function handleAddOpinion(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/opinions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kolId: opKolId,
        title: opTitle,
        content: opContent,
        sentiment: opSentiment,
        asset: opAsset,
        confidence: opConfidence,
        tags: opTags.split(",").map((t) => t.trim()).filter(Boolean),
        sourceUrl: opSourceUrl,
        sourceType: opSourceType,
        category: opCategory,
        targetPrice: opTargetPrice ? Number(opTargetPrice) : undefined,
        priceAtPost: opPriceAtPost ? Number(opPriceAtPost) : undefined,
      }),
    });
    if (res.ok) {
      setOpTitle("");
      setOpContent("");
      setOpTags("");
      setOpConfidence(5);
      setOpSourceUrl("");
      setOpPriceAtPost("");
      setOpTargetPrice("");
      setStatus("Opinion added!");
      setTimeout(() => setStatus(""), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
        <h1 className="mb-4 text-xl font-bold text-foreground sm:mb-6 sm:text-2xl">
          Admin Panel
        </h1>

        {status && (
          <div className="mb-4 rounded-lg bg-bullish/20 px-4 py-3 text-sm text-bullish">
            {status}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex gap-2 sm:mb-6">
          <button
            onClick={() => setTab("opinions")}
            className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "opinions"
                ? "bg-white/10 text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            Add Opinion
          </button>
          <button
            onClick={() => setTab("kols")}
            className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === "kols"
                ? "bg-white/10 text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            Manage KOLs
          </button>
        </div>

        {/* Add Opinion Form */}
        {tab === "opinions" && (
          <form
            onSubmit={handleAddOpinion}
            className="rounded-xl border border-white/10 bg-surface p-4 sm:p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              New Opinion
            </h2>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-muted">KOL</label>
              <select value={opKolId} onChange={(e) => setOpKolId(e.target.value)} required className={inputClass}>
                <option value="">Select KOL...</option>
                {kols.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.handle})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div>
                <label className="mb-1 block text-sm text-muted">Sentiment</label>
                <select value={opSentiment} onChange={(e) => setOpSentiment(e.target.value as "bullish" | "bearish")} className={inputClass}>
                  <option value="bullish">Bullish</option>
                  <option value="bearish">Bearish</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Asset</label>
                <input type="text" value={opAsset} onChange={(e) => setOpAsset(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Confidence</label>
                <input type="number" min={1} max={10} value={opConfidence} onChange={(e) => setOpConfidence(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Category</label>
                <select value={opCategory} onChange={(e) => setOpCategory(e.target.value)} className={inputClass}>
                  <option value="market-analysis">Market Analysis</option>
                  <option value="price-prediction">Price Prediction</option>
                  <option value="trade-idea">Trade Idea</option>
                  <option value="risk-warning">Risk Warning</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-muted">Title</label>
              <input type="text" value={opTitle} onChange={(e) => setOpTitle(e.target.value)} required placeholder="e.g., Bitcoin to $250K by 2028" className={inputClass} />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-muted">Content</label>
              <textarea value={opContent} onChange={(e) => setOpContent(e.target.value)} required rows={4} placeholder="Full opinion text..." className={`${inputClass} min-h-[100px]`} />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="mb-1 block text-sm text-muted">Source URL</label>
                <input type="url" value={opSourceUrl} onChange={(e) => setOpSourceUrl(e.target.value)} placeholder="https://twitter.com/..." className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Source Type</label>
                <select value={opSourceType} onChange={(e) => setOpSourceType(e.target.value)} className={inputClass}>
                  <option value="twitter">Twitter/X</option>
                  <option value="blog">Blog</option>
                  <option value="youtube">YouTube</option>
                  <option value="interview">Interview/TV</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="mb-1 block text-sm text-muted">Price at Post (optional)</label>
                <input type="number" step="0.01" value={opPriceAtPost} onChange={(e) => setOpPriceAtPost(e.target.value)} placeholder="e.g., 69800" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted">Target Price (optional)</label>
                <input type="number" step="0.01" value={opTargetPrice} onChange={(e) => setOpTargetPrice(e.target.value)} placeholder="e.g., 250000" className={inputClass} />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-muted">Tags (comma-separated)</label>
              <input type="text" value={opTags} onChange={(e) => setOpTags(e.target.value)} placeholder="#Bitcoin, #Macro, #LongTerm" className={inputClass} />
            </div>

            <button type="submit" className="min-h-[44px] w-full rounded-lg bg-bullish px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-bullish/80 sm:w-auto">
              Add Opinion
            </button>
          </form>
        )}

        {/* Manage KOLs */}
        {tab === "kols" && (
          <div>
            <form onSubmit={handleAddKOL} className="mb-6 rounded-xl border border-white/10 bg-surface p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Add New KOL</h2>
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted">Name</label>
                  <input type="text" value={kolName} onChange={(e) => setKolName(e.target.value)} required placeholder="Michael Saylor" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">Handle</label>
                  <input type="text" value={kolHandle} onChange={(e) => setKolHandle(e.target.value)} placeholder="@saylor" className={inputClass} />
                </div>
              </div>
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted">Bias</label>
                  <select value={kolBias} onChange={(e) => setKolBias(e.target.value as "bullish" | "bearish" | "neutral")} className={inputClass}>
                    <option value="bullish">Bullish</option>
                    <option value="bearish">Bearish</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">Credibility (0-100)</label>
                  <input type="number" min={0} max={100} value={kolCredibility} onChange={(e) => setKolCredibility(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">Tags</label>
                  <input type="text" value={kolTags} onChange={(e) => setKolTags(e.target.value)} placeholder="BTC, macro, tech" className={inputClass} />
                </div>
              </div>
              <button type="submit" className="min-h-[44px] w-full rounded-lg bg-bullish px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-bullish/80 sm:w-auto">
                Add KOL
              </button>
            </form>

            {/* KOL list */}
            <div className="rounded-xl border border-white/10 bg-surface p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Current KOLs ({kols.length})
              </h2>
              <div className="flex flex-col gap-3">
                {kols.map((kol) => (
                  <div key={kol.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-background p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          kol.bias === "bearish"
                            ? "bg-bearish/20 text-bearish"
                            : kol.bias === "bullish"
                              ? "bg-bullish/20 text-bullish"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {kol.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {kol.name}
                          </span>
                          {kol.verified && (
                            <span className="text-xs text-blue-400">&#10003;</span>
                          )}
                        </div>
                        <div className="text-xs text-muted">
                          {kol.handle} &middot; {kol.bias} &middot; {kol.credibility}%
                          {kol.followers && <span> &middot; {kol.followers}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKOL(kol.id)}
                      className="min-h-[44px] shrink-0 rounded-lg px-3 py-2 text-xs text-bearish transition-colors hover:bg-bearish/20"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
