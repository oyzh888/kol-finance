"use client";

import { useState, useEffect } from "react";

interface KOL {
  handle: string; name: string; title?: string;
  platform: string; followers: number; avatarUrl: string;
}
interface Opinion {
  id: string; stockTicker: string; kol: KOL;
  stance: "bull" | "bear" | "neutral"; confidence: "high" | "medium" | "low";
  quote: string; sourceUrl: string; sourceName?: string;
  publishedAt: string; tags: string[]; keyPoints: string[];
}
interface StockSummary {
  name: string; ticker: string; description: string;
  currentPrice?: number; lastUpdated: string;
  summary: { bullCount: number; bearCount: number; neutralCount: number; sentiment: string };
}

// ── Votes ──
const SEED_BULL = 847, SEED_BEAR = 312;
const VOTE_KEY  = "kol_votes_NVDA";
type VoteState  = { bull: number; bear: number; userVote: "bull" | "bear" | null };

function loadVotes(): VoteState {
  if (typeof window === "undefined") return { bull: SEED_BULL, bear: SEED_BEAR, userVote: null };
  try { const r = localStorage.getItem(VOTE_KEY); return r ? JSON.parse(r) : { bull: SEED_BULL, bear: SEED_BEAR, userVote: null }; }
  catch { return { bull: SEED_BULL, bear: SEED_BEAR, userVote: null }; }
}
function saveVotes(d: VoteState) { try { localStorage.setItem(VOTE_KEY, JSON.stringify(d)); } catch {} }

function timeAgo(s: string) {
  const d = Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
  return d === 0 ? "today" : d === 1 ? "1d ago" : `${d}d ago`;
}
function fmt(n: number) {
  return n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(0)+"K" : n > 0 ? String(n) : "";
}

// ── Recent events ──
const NVDA_EVENTS = [
  { label: "⚡ Q4财报 Feb 25", type: "hot",  tip: "2天后！全年最大催化剂" },
  { label: "▲ 升至Buy · Aletheia",  type: "bull", tip: "今日新评级，称当前价格太便宜" },
  { label: "▲ 目标 $275 · Wedbush", type: "bull", tip: "Dan Ives 3天前上调" },
  { label: "▼ 内部人抛售 115次",    type: "bear", tip: "90天内零买入，重要警告" },
  { label: "◆ 视野环球：方向待明",  type: "neutral", tip: "科技权重股打摆子，观望为主" },
];

// ── NVDA Ticker Hero ──
function NvdaHero({ stock }: { stock?: StockSummary }) {
  const price = stock?.currentPrice ?? 190.49;
  const change = +0.35;
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-3">
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono text-gray-500 border border-gray-700 rounded px-2 py-0.5">NASDAQ</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00ff88]">LIVE</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-white tracking-tight">NVDA</span>
            <span className="text-lg font-bold text-gray-300">${price.toFixed(2)}</span>
            <span className="text-sm font-bold text-[#00ff88]">+{change}% ▲</span>
          </div>
          <div className="text-xs text-gray-600 mt-0.5">{stock?.name ?? "NVIDIA Corporation"}</div>
        </div>
        <div className="flex gap-4 ml-auto text-right">
          <div><div className="text-[10px] text-gray-600 font-mono">分析师共识</div><div className="text-xs font-bold text-[#00ff88]">Strong Buy</div></div>
          <div><div className="text-[10px] text-gray-600 font-mono">均值目标</div><div className="text-xs font-bold text-white">$255.82</div></div>
          <div><div className="text-[10px] text-gray-600 font-mono">上行空间</div><div className="text-xs font-bold text-[#00ff88]">+34%</div></div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {NVDA_EVENTS.map((ev, i) => (
          <span key={i} title={ev.tip}
            className="text-[10px] font-mono px-2.5 py-1 rounded-full cursor-default transition-opacity hover:opacity-80"
            style={{
              background: ev.type==="hot" ? "rgba(255,200,0,0.12)" : ev.type==="bull" ? "rgba(0,255,136,0.10)" : ev.type==="neutral" ? "rgba(255,192,0,0.10)" : "rgba(255,51,85,0.10)",
              border: `1px solid ${ev.type==="hot" ? "rgba(255,200,0,0.35)" : ev.type==="bull" ? "rgba(0,255,136,0.35)" : ev.type==="neutral" ? "rgba(255,192,0,0.35)" : "rgba(255,51,85,0.35)"}`,
              color: ev.type==="hot" ? "#ffc800" : ev.type==="bull" ? "#00ff88" : ev.type==="neutral" ? "#ffc000" : "#ff3355",
            }}>{ev.label}</span>
        ))}
      </div>
      <div className="mt-4 h-px w-full" style={{ background:"linear-gradient(to right,transparent,rgba(255,255,255,0.08),transparent)" }} />
    </div>
  );
}

// ── Laser clash bar ──
function LaserBar({ bullPct }: { bullPct: number }) {
  return (
    <div className="relative w-full h-10 flex items-center">
      <div className="absolute left-0 h-3 rounded-l-full transition-all duration-1000"
        style={{ width:`calc(${bullPct}% - 8px)`, background:"linear-gradient(to right,#004422,#00ff88)", boxShadow:"0 0 14px 5px rgba(0,255,136,0.55),0 0 32px 10px rgba(0,255,136,0.2)" }} />
      <div className="absolute z-20 flex items-center justify-center" style={{ left:`calc(${bullPct}% - 14px)`, width:28, height:28 }}>
        <div className="laser-clash w-6 h-6" />
        {[0,1,2,3,4].map(i => (
          <div key={i} className="spark" style={{ "--dx":`${(i-2)*8}px`, animationDelay:`${i*0.18}s`, top:`${4+(i%2)*4}px`, left:`${4+i*4}px` } as React.CSSProperties} />
        ))}
      </div>
      <div className="absolute right-0 h-3 rounded-r-full transition-all duration-1000"
        style={{ width:`calc(${100-bullPct}% - 8px)`, background:"linear-gradient(to left,#440011,#ff3355)", boxShadow:"0 0 14px 5px rgba(255,51,85,0.55),0 0 32px 10px rgba(255,51,85,0.2)" }} />
    </div>
  );
}

// ── Side vote button ──
function SideVote({ side, votes, onVote }: { side:"bull"|"bear"; votes:VoteState; onVote:(s:"bull"|"bear")=>void }) {
  const isBull = side==="bull";
  const accent = isBull ? "#00ff88" : "#ff3355";
  const bg     = isBull ? "linear-gradient(135deg,#002211,#00aa55)" : "linear-gradient(135deg,#220011,#aa0033)";
  const total  = votes.bull + votes.bear;
  const myPct  = total>0 ? Math.round((isBull?votes.bull:votes.bear)/total*100) : 50;
  const voted  = votes.userVote;
  const votedMe= votes.userVote===side;
  return (
    <div className="mb-3 rounded-xl overflow-hidden" style={{ border:`1px solid ${accent}22`, background:isBull?"#031208":"#120308" }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[10px] font-mono" style={{color:accent}}>{isBull?"▲ 看多投票":"看空投票 ▼"}</span>
        <span className="text-[10px] font-mono text-gray-600">{(isBull?votes.bull:votes.bear).toLocaleString()} 票 · {myPct}%</span>
      </div>
      <div className="mx-4 mb-3 h-1.5 rounded-full bg-gray-900 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${myPct}%`, background:accent, boxShadow:`0 0 6px ${accent}` }} />
      </div>
      <div className="px-4 pb-4">
        {voted ? (
          <div className="text-center text-xs py-2.5 rounded-lg font-mono"
            style={{ border:`1px solid ${accent}44`, color:votedMe?accent:"#666", background:votedMe?`${accent}14`:"transparent" }}>
            {votedMe ? `✓ 你投了${isBull?"看多":"看空"}` : `已投${isBull?"看空":"看多"}`}
          </div>
        ) : (
          <button onClick={()=>onVote(side)}
            className="w-full py-2.5 rounded-lg text-sm font-bold font-mono transition-all hover:scale-[1.03] active:scale-95"
            style={{ background:bg, border:`1px solid ${accent}66`, color:accent, boxShadow:`0 0 14px ${accent}30` }}>
            {isBull?"▲ 我看多 BULL":"▼ 我看空 BEAR"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Opinion card ──
function OpinionCard({ opinion, idx }: { opinion: Opinion; idx: number }) {
  const isNeutral = opinion.stance === "neutral";
  const isBull    = opinion.stance === "bull";
  const accent    = isNeutral ? "#ffc000" : isBull ? "#00ff88" : "#ff3355";
  const floatCls  = isNeutral ? "card-float-sway" : idx%2===0 ? "card-float-odd" : "card-float-even";
  const glowCls   = isNeutral ? "neutral-card neon-border-neutral" : isBull ? "bull-card neon-border-bull" : "bear-card neon-border-bear";
  const bgColor   = isNeutral ? "#161000" : isBull ? "#041a0f" : "#1a0408";
  const tagCls    = isNeutral ? "tag-neutral" : isBull ? "tag-bull" : "tag-bear";
  const badge     = isNeutral ? "⚖" : isBull ? "▲" : "▼";

  return (
    <div className={`${floatCls} ${glowCls} rounded-xl p-4 mb-3 relative overflow-hidden`} style={{ background:bgColor }}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10 pointer-events-none" style={{ background:accent }} />
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <img src={opinion.kol.avatarUrl} alt={opinion.kol.name}
            className="w-10 h-10 rounded-full object-cover"
            style={{ border:`2px solid ${accent}` }}
            onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(opinion.kol.name)}&background=111&color=fff&size=40`; }} />
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold px-1 rounded"
            style={{ background:accent, color:"#000" }}>{badge}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm truncate" style={{color:accent}}>{opinion.kol.name}</div>
          <div className="text-xs text-gray-500 truncate">{opinion.kol.title || `@${opinion.kol.handle}`}</div>
          {fmt(opinion.kol.followers) && <div className="text-xs text-gray-600">{fmt(opinion.kol.followers)} followers</div>}
        </div>
        <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(opinion.publishedAt)}</span>
      </div>
      <h3 className="font-bold text-sm mb-2 leading-snug" style={{color:accent}}>
        &ldquo;{opinion.quote.length>110 ? opinion.quote.slice(0,110)+"…" : opinion.quote}&rdquo;
      </h3>
      <div className="mb-3 space-y-1">
        {opinion.keyPoints.slice(0,2).map((pt,i) => (
          <p key={i} className="text-xs text-gray-300 leading-relaxed"><span style={{color:accent}}>› </span>{pt}</p>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {opinion.tags.slice(0,3).map(tag => (
          <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${tagCls}`}>#{tag}</span>
        ))}
      </div>
      <a href={opinion.sourceUrl} target="_blank" rel="noopener noreferrer"
        className="text-[10px] text-gray-600 hover:text-gray-400 underline">
        来源: {opinion.sourceName || opinion.sourceUrl.split("/")[2]} →
      </a>
    </div>
  );
}

// ── Scoreboard ──
function Scoreboard({ bulls, bears, neutrals, bullPct }: {
  bulls: Opinion[]; bears: Opinion[]; neutrals: Opinion[]; bullPct: number;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-2">
      {/* Three-panel score */}
      <div className="relative flex items-stretch rounded-2xl overflow-hidden"
        style={{ background:"rgba(8,8,14,0.92)", border:"1px solid rgba(255,255,255,0.07)" }}>

        {/* BULL panel */}
        <div className="flex-1 px-6 py-5 text-left relative">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"linear-gradient(to right,rgba(0,255,136,0.12),transparent)" }} />
          <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">多方 BULL</div>
          <div className="score-bull text-6xl font-black text-[#00ff88] leading-none">{bulls.length}</div>
          <div className="text-[10px] text-[#00ff88]/50 mt-1">看涨 KOL</div>
          <div className="text-[10px] text-gray-700 mt-1 font-mono">高置信: {bulls.filter(b=>b.confidence==="high").length}</div>
        </div>

        {/* CENTER: neutral + VS */}
        <div className="flex flex-col items-center justify-center px-5 py-5 z-10 relative"
          style={{ minWidth:120, borderLeft:"1px solid rgba(255,255,255,0.06)", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse at 50% 50%,rgba(255,192,0,0.06),transparent 70%)" }} />
          {/* Neutral count */}
          <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">中立</div>
          <div className="score-neutral text-3xl font-black text-[#ffc000] leading-none">⚖{neutrals.length}</div>
          <div className="text-[9px] text-[#ffc000]/50 mt-1 mb-3">观望</div>
          {/* VS divider */}
          <div className="w-full h-px mb-3" style={{ background:"linear-gradient(to right,transparent,rgba(255,255,255,0.12),transparent)" }} />
          <div className="vs-flash text-base font-black text-gray-500 tracking-widest">VS</div>
          <div className="text-[9px] text-gray-700 font-mono mt-1">{bullPct}·{100-bullPct}</div>
        </div>

        {/* BEAR panel */}
        <div className="flex-1 px-6 py-5 text-right relative">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"linear-gradient(to left,rgba(255,51,85,0.12),transparent)" }} />
          <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">空方 BEAR</div>
          <div className="score-bear text-6xl font-black text-[#ff3355] leading-none">{bears.length}</div>
          <div className="text-[10px] text-[#ff3355]/50 mt-1">看跌 KOL</div>
          <div className="text-[10px] text-gray-700 mt-1 font-mono">高置信: {bears.filter(b=>b.confidence==="high").length}</div>
        </div>
      </div>

      {/* Laser bar */}
      <div className="mt-3 px-1">
        <LaserBar bullPct={bullPct} />
        <div className="flex justify-between text-[10px] font-mono text-gray-700 px-0.5 mt-1">
          <span>▲ BULL {bullPct}%</span>
          <span className="text-[#ffc000]/40">⚖ 中立不计入比例</span>
          <span>BEAR {100-bullPct}% ▼</span>
        </div>
      </div>
    </div>
  );
}

// ── Column header ──
function ColHeader({ label, count, accent, align }: { label:string; count:number; accent:string; align:"left"|"center"|"right" }) {
  return (
    <div className={`flex items-center gap-2 mb-2 ${align==="right"?"flex-row-reverse":align==="center"?"justify-center":""}`}>
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background:accent }} />
      <span className="text-xs font-bold tracking-widest uppercase font-mono" style={{color:accent}}>{label} ({count})</span>
    </div>
  );
}

// ── Main ──
export default function Home() {
  const [selectedStock, setSelectedStock] = useState("NVDA");
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [stocks, setStocks]     = useState<Record<string, StockSummary>>({});
  const [loading, setLoading]   = useState(true);
  const [votes, setVotes]       = useState<VoteState>({ bull:SEED_BULL, bear:SEED_BEAR, userVote:null });
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setVotes(loadVotes()); setMounted(true); }, [selectedStock]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/opinions?stock=${selectedStock}`).then(r=>r.json()),
      fetch("/api/stocks").then(r=>r.json()),
    ]).then(([ops,stks]) => { setOpinions(ops); setStocks(stks); setLoading(false); });
  }, [selectedStock]);

  const handleVote = (side:"bull"|"bear") => {
    if (votes.userVote) return;
    const next = { bull:votes.bull+(side==="bull"?1:0), bear:votes.bear+(side==="bear"?1:0), userVote:side };
    setVotes(next); saveVotes(next);
  };

  const bulls    = opinions.filter(o=>o.stance==="bull");
  const bears    = opinions.filter(o=>o.stance==="bear");
  const neutrals = opinions.filter(o=>o.stance==="neutral");
  const btotal   = bulls.length + bears.length;
  const bullPct  = btotal>0 ? Math.round(bulls.length/btotal*100) : 50;

  return (
    <div className="min-h-screen arena-bg text-white font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/50 border-b border-gray-800/60 px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">KOL Sentiment · Battle Board</span>
        <select value={selectedStock} onChange={e=>setSelectedStock(e.target.value)}
          className="bg-gray-900/80 border border-gray-700 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none font-mono">
          {Object.keys(stocks).map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </header>

      {/* Hero */}
      <NvdaHero stock={stocks[selectedStock]} />

      {/* Scoreboard */}
      <Scoreboard bulls={bulls} bears={bears} neutrals={neutrals} bullPct={bullPct} />

      {/* Battle Grid — 3 columns */}
      <main className="max-w-6xl mx-auto px-3 pb-12 mt-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-3xl mb-3 animate-spin inline-block">⚡</div>
            <div className="text-sm text-gray-500 font-mono">Loading...</div>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="grid grid-cols-1 md:grid-cols-[5fr_3fr_5fr] gap-3 mb-1">
              <ColHeader label="▲ 看多 BULL" count={bulls.length}    accent="#00ff88" align="left"   />
              <ColHeader label="⚖ 中立"       count={neutrals.length} accent="#ffc000" align="center" />
              <ColHeader label="看空 BEAR ▼"  count={bears.length}    accent="#ff3355" align="right"  />
            </div>

            {/* Divider line */}
            <div className="relative mb-4 h-px">
              <div className="absolute inset-0" style={{
                background:"linear-gradient(to right,rgba(0,255,136,0.5),rgba(0,255,136,0.1),rgba(255,192,0,0.4),rgba(255,51,85,0.1),rgba(255,51,85,0.5))"
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="vs-flash text-xs bg-[#060608] px-3 text-gray-600 font-mono">⚔️ BATTLE ZONE ⚔️</span>
              </div>
            </div>

            {/* Three-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-[5fr_3fr_5fr] gap-3">

              {/* BULL column */}
              <div>
                {mounted && <SideVote side="bull" votes={votes} onVote={handleVote} />}
                {bulls.length===0
                  ? <p className="text-center py-8 text-gray-700 font-mono text-sm">No bull opinions</p>
                  : bulls.map((op,i)=><OpinionCard key={op.id} opinion={op} idx={i} />)}
              </div>

              {/* NEUTRAL center column */}
              <div className="neutral-col-bg rounded-xl px-3 py-4">
                {/* Referee label */}
                <div className="text-center mb-4">
                  <div className="text-2xl mb-1">⚖️</div>
                  <div className="text-[10px] font-mono text-[#ffc000]/70 uppercase tracking-widest">裁判席</div>
                  <div className="text-[9px] font-mono text-gray-700 mt-1">观望者不参与多空计票</div>
                </div>
                {/* Thin gold divider */}
                <div className="h-px mb-4" style={{ background:"linear-gradient(to right,transparent,rgba(255,192,0,0.4),transparent)" }} />

                {neutrals.length===0
                  ? <p className="text-center py-6 text-gray-700 font-mono text-xs">暂无中立观点</p>
                  : neutrals.map((op,i)=><OpinionCard key={op.id} opinion={op} idx={i} />)}

                {/* Bottom note */}
                <div className="mt-4 pt-3 border-t border-yellow-900/30 text-center">
                  <div className="text-[9px] font-mono text-gray-700 leading-relaxed">
                    中立观点<br/>等待财报验证
                  </div>
                </div>
              </div>

              {/* BEAR column */}
              <div>
                {mounted && <SideVote side="bear" votes={votes} onVote={handleVote} />}
                {bears.length===0
                  ? <p className="text-center py-8 text-gray-700 font-mono text-sm">No bear opinions</p>
                  : bears.map((op,i)=><OpinionCard key={op.id} opinion={op} idx={i} />)}
              </div>

            </div>
          </>
        )}
      </main>

      <footer className="text-center py-3 text-[10px] font-mono text-gray-800 border-t border-gray-900">
        NVDA KOL Battle Board · 近7天数据 · kol.when2buy.ai
      </footer>
    </div>
  );
}
