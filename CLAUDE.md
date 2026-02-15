# KOL Finance - Project Guide

## Project Overview

KOL Finance is a financial Key Opinion Leader (KOL) opinion aggregation platform. It tracks real-world financial influencers' market opinions (bullish/bearish), displays them in a dark terminal-style UI, and tracks whether their predictions were correct over time.

**Live URL**: https://finance.steveouyang.com
**Status**: Phase 1 complete - core display, admin, real KOL data
**Started**: 2026-02-14

### What it does
- Aggregates opinions from 10+ real financial KOLs (Saylor, Cathie Wood, Peter Schiff, etc.)
- Displays bearish vs bullish opinions in a split-column layout
- Tracks market prices at time of posting vs current price
- Links back to original source (Twitter, CNBC, blogs)
- Provides admin interface for manual data entry

### Tech Stack
- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Data**: JSON files (no database)
- **Deployment**: Cloudflare Tunnel to NAS

---

## Architecture

```
Browser -> Cloudflare Tunnel -> NAS (port 3100) -> Next.js Server
                                                      |
                                                  data/*.json (filesystem)
```

### Frontend (Next.js 15+ App Router)
- Server components for the main dashboard (SSR, `force-dynamic`)
- Client components for admin page and interactive elements
- No client-side data fetching on the main page - all server-rendered

### Data Storage (JSON files)
- `data/kols.json` - single file with all KOL profiles
- `data/opinions/YYYY-MM-DD.json` - one file per day of opinions
- Read/written by `web/src/lib/data.ts` using Node.js `fs` module
- Data directory lives OUTSIDE the `web/` directory (at project root)

### Data Flow
```
1. User visits / (dashboard)
2. Next.js server component calls getOpinionsWithKOLs(latestDate)
3. data.ts reads data/kols.json + data/opinions/YYYY-MM-DD.json
4. Joins opinions with KOL profiles via kolId
5. Renders OpinionCard components (bearish left, bullish right)

Admin flow:
1. User visits /admin (client component)
2. Fetches KOLs from GET /api/kols
3. Submits form -> POST /api/opinions
4. API route writes to JSON file via data.ts
5. Next page load picks up the new data
```

---

## Data Structure

### KOL Profile (`data/kols.json`)

```typescript
interface KOL {
  id: string;              // "michael-saylor" (kebab-case, unique)
  name: string;            // "Michael Saylor"
  handle: string;          // "@saylor"
  avatar: string;          // "MS" (2-letter abbreviation)
  bias: "bullish" | "bearish" | "neutral";
  credibility: number;     // 0-100
  tags: string[];          // ["BTC", "macro", "Strategy"]
  twitterUrl?: string;     // "https://x.com/saylor"
  verified?: boolean;      // Twitter verified status
  followers?: string;      // "4.1M"
  addedAt?: string;        // "2026-02-15"
}
```

### Opinion (`data/opinions/YYYY-MM-DD.json`)

```typescript
interface Opinion {
  id: string;              // "op-2026-02-15-001"
  kolId: string;           // must match a KOL id
  title: string;           // headline summary
  content: string;         // full opinion text

  // Source tracking
  sourceType: "twitter" | "blog" | "youtube" | "interview" | "newsletter";
  sourceUrl: string;       // link to original post/article
  archiveUrl?: string;     // archive.ph backup link

  // Classification
  sentiment: "bullish" | "bearish" | "neutral";
  asset: string;           // "BTC", "NVDA", "SPY", "GLD"
  confidence: number;      // 1-10
  targetPrice?: number;    // price target if given
  timeframe?: string;      // "2026-12-31" if given
  tags: string[];          // ["#Bitcoin", "#Macro"]
  category?: "price-prediction" | "risk-warning" | "market-analysis" | "trade-idea";

  // Timestamps
  publishedAt: string;     // ISO 8601 - when the KOL published it
  addedAt?: string;        // when we added it to the system

  // Market tracking
  marketResult?: {
    priceAtPost: number;   // asset price when opinion was published
    currentPrice: number;  // latest known price
    priceChange: string;   // "+4.96%"
    outcome: "correct" | "incorrect" | "pending" | "partial";
    checkpoints?: Array<{ date: string; price: number; change: string }>;
    finalVerified: boolean;
    verifiedAt: string | null;
  };

  // Social engagement
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
  };
}
```

### Current KOLs (as of 2026-02-15)

| KOL | Handle | Bias | Credibility | Followers |
|-----|--------|------|-------------|-----------|
| Michael Saylor | @saylor | bullish | 82 | 4.1M |
| Cathie Wood | @CathieDWood | bullish | 75 | 1.6M |
| Peter Schiff | @PeterSchiff | bearish | 70 | 1.1M |
| Raoul Pal | @RaoulGMI | bullish | 85 | 1.2M |
| Willy Woo | @woonomic | neutral | 88 | 1.1M |
| Balaji Srinivasan | @balajis | bullish | 80 | 1.0M |
| Liz Ann Sonders | @LizAnnSonders | neutral | 90 | 452.9K |
| Jim Cramer | @jimcramer | bullish | 60 | 2.1M |
| CZ (Binance) | @cz_binance | bullish | 78 | 8.5M |
| Morgan Housel | @morganhousel | neutral | 92 | 567.3K |

---

## File Structure

```
01-kol-finance/
├── CLAUDE.md                    # This file - project documentation
├── PLAN.md                      # Original development plan (Chinese)
├── DATA_STRUCTURE.md            # Data schema design doc (Chinese)
├── INSTRUCTIONS.md              # Initial task instructions
├── reference/
│   └── ui.png                   # Reference UI screenshot (StockLens)
│
├── data/                        # ALL DATA LIVES HERE (not in web/)
│   ├── kols.json                # 10 real KOL profiles
│   └── opinions/
│       ├── 2026-02-14.json      # Demo seed data (8 opinions)
│       └── 2026-02-15.json      # Real KOL opinions (14 opinions)
│
└── web/                         # Next.js application
    ├── package.json             # Next 16.1.6, React 19, Tailwind 4
    ├── tsconfig.json            # TypeScript config (@ -> ./src/*)
    ├── next.config.ts           # Next.js config (minimal)
    ├── postcss.config.mjs       # PostCSS + Tailwind
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx       # Root layout (dark theme, Geist fonts)
    │   │   ├── page.tsx         # Main dashboard (server component)
    │   │   ├── globals.css      # CSS variables, animations, scrollbar
    │   │   ├── admin/
    │   │   │   └── page.tsx     # Admin panel (client component)
    │   │   └── api/
    │   │       ├── kols/
    │   │       │   └── route.ts # GET/POST/DELETE KOLs
    │   │       └── opinions/
    │   │           └── route.ts # GET/POST/DELETE opinions
    │   ├── components/
    │   │   ├── Header.tsx       # Sticky header with nav
    │   │   ├── OpinionCard.tsx  # Opinion card (market result, source link)
    │   │   └── SentimentGauge.tsx # Bull/bear ratio gauge
    │   └── lib/
    │       ├── types.ts         # TypeScript interfaces
    │       └── data.ts          # JSON file read/write functions
    └── public/
        └── favicon.ico
```

### Key files explained

| File | Purpose |
|------|---------|
| `web/src/lib/data.ts` | All data access. Reads/writes JSON files from `../data/`. The `DATA_DIR` is relative to `process.cwd()` (the `web/` directory), so it resolves to `01-kol-finance/data/`. |
| `web/src/lib/types.ts` | All TypeScript interfaces. The source of truth for data shape. |
| `web/src/app/page.tsx` | Server component. Calls `getOpinionsWithKOLs()` directly, no API needed. Uses `force-dynamic` to bypass static generation. |
| `web/src/app/admin/page.tsx` | Client component. Uses `fetch()` to call API routes. Contains forms for adding KOLs and opinions. |
| `web/src/components/OpinionCard.tsx` | The main card component. Shows KOL info, market result badge, confidence bar, tags, engagement stats, and "查看原文" source link. |

---

## Current Features

### Dashboard (`/`)
- Three-column layout: Bearish (red) | Bullish (green) | Sidebar
- On mobile: sentinel gauge on top, cards stack vertically
- Each opinion card shows:
  - KOL avatar, name (clickable to Twitter), verified badge, follower count
  - Source type icon (X, TV, NL, B)
  - Market result: price change since post (e.g., "+10.44%")
  - Confidence bar (1-10)
  - Target price and timeframe (if set)
  - Content preview (3-line clamp)
  - Tags and asset badge
  - Engagement stats (likes, RTs, replies)
  - "查看原文 ->" button linking to source

### Sentiment Gauge (sidebar / mobile top)
- Bull/bear ratio bar
- Count of bullish vs bearish opinions
- Average confidence per sentiment

### Admin Panel (`/admin`)
- **Add Opinion tab**: Select KOL, set sentiment/asset/confidence, enter title/content, paste source URL, set source type, optional price-at-post and target price
- **Manage KOLs tab**: Add new KOLs with name/handle/bias/credibility/tags. View and delete existing KOLs.
- All inputs are 44px min-height for mobile touch targets

### Mobile Responsiveness
- Cards stack vertically on mobile (< 1024px)
- Sentiment gauge moves to top on mobile
- Asset ticker hidden on small screens
- All touch targets >= 44px
- No horizontal scroll
- Tested for 375px (iPhone SE) and 414px (iPhone Pro)

---

## Development Setup

### Prerequisites
- Node.js 20+
- npm

### Run locally
```bash
cd web
npm install
npm run dev
# Open http://localhost:3000
```

### Build for production
```bash
cd web
npm run build
npm start -- -p 3100
```

### Add a new KOL

**Option 1: Admin UI**
1. Go to `/admin` -> "Manage KOLs" tab
2. Fill in name, handle, bias, credibility, tags
3. Click "Add KOL"

**Option 2: Edit JSON directly**
```bash
# Edit data/kols.json, add a new entry:
{
  "id": "new-kol-name",       # kebab-case, must be unique
  "name": "Display Name",
  "handle": "@twitter_handle",
  "avatar": "DN",              # 2-letter abbreviation
  "bias": "bullish",
  "credibility": 75,
  "tags": ["crypto", "macro"],
  "twitterUrl": "https://x.com/twitter_handle",
  "verified": true,
  "followers": "500K",
  "addedAt": "2026-02-15"
}
```

### Add a new opinion

**Option 1: Admin UI**
1. Go to `/admin` -> "Add Opinion" tab
2. Select KOL, fill in all fields
3. Click "Add Opinion"
4. Opinion is saved to today's date file

**Option 2: Edit JSON directly**
```bash
# Edit data/opinions/YYYY-MM-DD.json (create if doesn't exist)
# Add an entry following the Opinion schema above
# Must include: id, kolId (matching a KOL), title, content, sourceType,
#   sourceUrl, sentiment, asset, confidence, tags, publishedAt
```

---

## API Routes

### `GET /api/kols`
Returns all KOL profiles from `data/kols.json`.

### `POST /api/kols`
Creates a new KOL. Body: `{ name, handle, bias, credibility?, tags? }`.
Auto-generates `id` and `avatar` from name.

### `DELETE /api/kols`
Deletes a KOL. Body: `{ id }`.

### `GET /api/opinions?date=YYYY-MM-DD`
Returns opinions for a date, joined with KOL data. Defaults to today.
Special: `?date=dates` returns available date strings.

### `POST /api/opinions`
Creates a new opinion. Body includes all opinion fields.
Auto-generates `id`, `publishedAt`, `addedAt`. If `priceAtPost` is provided, creates a `marketResult` object.

### `DELETE /api/opinions`
Deletes an opinion. Body: `{ date, id }`.

---

## Deployment

### Current Setup
- **Domain**: finance.steveouyang.com
- **Port**: 3100
- **Server**: NAS via Cloudflare Tunnel
- **Process**: `npm start -- -p 3100` (from `web/` directory)

### Cloudflare Tunnel Config
The tunnel routes `finance.steveouyang.com` to `http://localhost:3100` on the NAS.

### Deploy Steps
```bash
cd /root/clawd/projects/01-kol-finance/web
npm run build
npm start -- -p 3100
```

For persistent running, use pm2 or systemd:
```bash
pm2 start npm --name "kol-finance" -- start -- -p 3100
```

---

## Design System

### Colors (CSS variables in globals.css)
| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `#0a0a0f` | Page background |
| `--foreground` | `#e4e4e7` | Primary text |
| `--surface` | `#111118` | Card/panel backgrounds |
| `--muted` | `#71717a` | Secondary text |
| `--accent-bearish` | `#ef4444` | Bearish/red elements |
| `--accent-bullish` | `#22c55e` | Bullish/green elements |
| `--card-bearish` | `#1a0a0a` | Bearish card background |
| `--card-bullish` | `#0a1a0f` | Bullish card background |

### Animations
- `pulse-bearish`: Subtle red glow on bearish cards
- `pulse-bullish`: Subtle green glow on bullish cards

### Fonts
- **Sans**: Geist Sans (via `next/font/google`)
- **Mono**: Geist Mono (used for prices and percentages)

---

## Future Roadmap

### Phase 2: Automation
- [ ] Twitter/X API integration for auto-fetching KOL posts
- [ ] Automatic price updates via CoinGecko/Alpha Vantage API
- [ ] Auto-calculate `priceChange` and `outcome` in marketResult
- [ ] Cron job to update currentPrice daily

### Phase 3: OpenClaw Bots
- [ ] Bullish bot (@kol_bullish_bot) - aggregates bullish opinions
- [ ] Bearish bot (@kol_bearish_bot) - aggregates bearish opinions
- [ ] Telegram push notifications for new high-confidence opinions
- [ ] Signal generation based on consensus

### Phase 4: Enhanced UI
- [ ] Date navigation (click to load different days)
- [ ] Asset filter (show only BTC, NVDA, etc.)
- [ ] KOL detail pages with accuracy history
- [ ] Stats dashboard (accuracy rates, consensus tracking)
- [ ] Chart integration (TradingView widget or Recharts)

### Phase 5: Data Pipeline
- [ ] RSS feed parsing for blog posts
- [ ] YouTube transcript analysis
- [ ] Archive.ph auto-saving
- [ ] CSV bulk import

---

## Contributing

### Code Style
- TypeScript strict mode
- Tailwind CSS for all styling (no CSS modules)
- Server components by default, `"use client"` only when needed
- Mobile-first responsive design (min 44px touch targets)

### Naming Conventions
- KOL IDs: `kebab-case` (e.g., `michael-saylor`)
- Opinion IDs: `op-YYYY-MM-DD-NNN` (e.g., `op-2026-02-15-001`)
- Components: PascalCase files (e.g., `OpinionCard.tsx`)
- Lib files: camelCase (e.g., `data.ts`)

### Data Quality Checklist
When adding opinions:
- [ ] `sourceUrl` is a real, working link
- [ ] `publishedAt` matches when the KOL actually posted
- [ ] `asset` uses ticker format (BTC not Bitcoin, AAPL not Apple)
- [ ] `sentiment` matches the actual opinion content
- [ ] `priceAtPost` is the real asset price at time of posting
- [ ] `kolId` matches an existing KOL in kols.json

### Important Notes
- The `data/` directory is outside `web/` - data.ts uses `path.join(process.cwd(), "..", "data")`
- The main page uses `export const dynamic = "force-dynamic"` to avoid static caching
- The old demo data in `2026-02-14.json` uses fake KOL IDs and should not be referenced
- All real data starts from `2026-02-15.json`
