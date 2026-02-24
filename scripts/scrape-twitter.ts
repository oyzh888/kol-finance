/**
 * Apify Tweet Scraper V2 Integration
 *
 * Scrapes recent tweets from KOL Twitter handles using Apify,
 * saves raw data to data/twitter-raw/, and converts to Opinion format.
 *
 * Usage:
 *   npx tsx scripts/scrape-twitter.ts                    # scrape all KOLs
 *   npx tsx scripts/scrape-twitter.ts --handle @saylor   # scrape one handle
 *   npx tsx scripts/scrape-twitter.ts --max 5            # limit tweets per KOL
 *   npx tsx scripts/scrape-twitter.ts --dry-run          # preview without saving
 */

import { ApifyClient } from "apify-client";
import { promises as fs } from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const KOLS_FILE = path.join(DATA_DIR, "kols.json");
const RAW_DIR = path.join(DATA_DIR, "twitter-raw");
const OPINIONS_DIR = path.join(DATA_DIR, "opinions");

const APIFY_TOKEN = process.env.APIFY_API_KEY || process.env.APIFY_TOKEN || "";
const TWEET_SCRAPER_ACTOR = "apidojo/tweet-scraper";
const DEFAULT_MAX_ITEMS = 10;

// ---------------------------------------------------------------------------
// Types (mirrors web/src/lib/types.ts)
// ---------------------------------------------------------------------------

interface KOL {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bias: "bullish" | "bearish" | "neutral";
  credibility: number;
  tags: string[];
  twitterUrl?: string;
  verified?: boolean;
  followers?: string;
  addedAt?: string;
}

interface RawTweet {
  id: string;
  text: string;
  full_text?: string;
  created_at: string;
  user: {
    screen_name: string;
    name: string;
  };
  retweet_count: number;
  favorite_count: number;
  reply_count?: number;
  url?: string;
  entities?: {
    urls?: Array<{ expanded_url: string }>;
    hashtags?: Array<{ text: string }>;
  };
  [key: string]: unknown;
}

interface OpinionOutput {
  id: string;
  kolId: string;
  title: string;
  content: string;
  sourceType: "twitter";
  sourceUrl: string;
  sentiment: "bullish" | "bearish" | "neutral";
  asset: string;
  confidence: number;
  tags: string[];
  category: string;
  publishedAt: string;
  addedAt: string;
  engagement?: {
    likes?: number;
    retweets?: number;
    replies?: number;
  };
  marketResult: null;
}

// ---------------------------------------------------------------------------
// Sentiment Analysis (keyword-based)
// ---------------------------------------------------------------------------

const BULLISH_KEYWORDS = [
  "buy",
  "buying",
  "long",
  "bullish",
  "moon",
  "pump",
  "rally",
  "breakout",
  "accumulate",
  "undervalued",
  "upside",
  "growth",
  "higher",
  "all-time high",
  "ath",
  "hodl",
  "hold",
  "opportunity",
  "strong",
  "momentum",
  "green",
  "rip",
  "send it",
  "rocket",
  "surge",
  "soar",
  "bull run",
  "adoption",
  "institutional",
  "etf",
  "halving",
  "scarcity",
  "inflation hedge",
  "digital gold",
  "store of value",
];

const BEARISH_KEYWORDS = [
  "sell",
  "selling",
  "short",
  "bearish",
  "crash",
  "dump",
  "correction",
  "breakdown",
  "overvalued",
  "downside",
  "decline",
  "lower",
  "fear",
  "risk",
  "bubble",
  "top",
  "exit",
  "weak",
  "red",
  "capitulation",
  "liquidation",
  "recession",
  "collapse",
  "ponzi",
  "fraud",
  "worthless",
  "dead",
  "scam",
  "rug pull",
  "blow off top",
];

const ASSET_KEYWORDS: Record<string, string[]> = {
  BTC: ["bitcoin", "btc", "$btc", "sats", "satoshi", "halving"],
  ETH: ["ethereum", "eth", "$eth", "ether", "vitalik"],
  SOL: ["solana", "sol", "$sol"],
  NVDA: ["nvidia", "nvda", "$nvda", "jensen"],
  TSLA: ["tesla", "tsla", "$tsla"],
  AAPL: ["apple", "aapl", "$aapl"],
  GOOGL: ["google", "googl", "$googl", "alphabet", "goog", "$goog"],
  SPY: ["s&p", "sp500", "spx", "$spx", "spy", "$spy", "s&p 500"],
  QQQ: ["nasdaq", "qqq", "$qqq", "nasdaq-100", "tech stocks"],
  GLD: ["gold", "xau", "$gold", "gld", "$gld", "precious metal"],
};

function analyzeSentiment(text: string): "bullish" | "bearish" | "neutral" {
  const lower = text.toLowerCase();
  let bullScore = 0;
  let bearScore = 0;

  for (const kw of BULLISH_KEYWORDS) {
    if (lower.includes(kw)) bullScore++;
  }
  for (const kw of BEARISH_KEYWORDS) {
    if (lower.includes(kw)) bearScore++;
  }

  if (bullScore > bearScore && bullScore >= 2) return "bullish";
  if (bearScore > bullScore && bearScore >= 2) return "bearish";
  if (bullScore > bearScore) return "bullish";
  if (bearScore > bullScore) return "bearish";
  return "neutral";
}

function detectAssets(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [asset, keywords] of Object.entries(ASSET_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        found.push(asset);
        break;
      }
    }
  }
  return found.length > 0 ? found : ["CRYPTO"];
}

function detectAsset(text: string): string {
  const assets = detectAssets(text);
  return assets.join(" + ");
}

function extractTags(text: string): string[] {
  const hashtags = text.match(/#\w+/g) || [];
  return [...new Set(hashtags.map((t) => t.toLowerCase()))].slice(0, 5);
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

// ---------------------------------------------------------------------------
// Apify Scraping
// ---------------------------------------------------------------------------

async function scrapeTweets(
  handles: string[],
  maxItems: number
): Promise<RawTweet[]> {
  if (!APIFY_TOKEN) {
    throw new Error(
      "Missing APIFY_API_KEY. Set it in environment or .env file.\n" +
        "  export APIFY_API_KEY=apify_api_xxxxx"
    );
  }

  const client = new ApifyClient({ token: APIFY_TOKEN });

  // Strip @ from handles
  const cleanHandles = handles.map((h) => h.replace(/^@/, ""));

  console.log(
    `Scraping tweets for ${cleanHandles.length} handle(s): ${cleanHandles.join(", ")}`
  );
  console.log(`Max items per handle: ${maxItems}`);

  const input = {
    twitterHandles: cleanHandles,
    maxItems: maxItems * cleanHandles.length,
    addUserInfo: true,
    scrapeTweetReplies: false,
  };

  console.log("Starting Apify actor run...");
  const run = await client.actor(TWEET_SCRAPER_ACTOR).call(input);
  console.log(`Actor run finished. Dataset ID: ${run.defaultDatasetId}`);

  const { items } = await client
    .dataset(run.defaultDatasetId)
    .listItems();

  console.log(`Fetched ${items.length} tweets total.`);
  return items as RawTweet[];
}

// ---------------------------------------------------------------------------
// Data Conversion
// ---------------------------------------------------------------------------

function tweetToOpinion(tweet: RawTweet, kol: KOL): OpinionOutput {
  const text = tweet.full_text || tweet.text || "";
  const sentiment = analyzeSentiment(text);
  const asset = detectAsset(text);
  const tags = extractTags(text);
  const now = new Date().toISOString();

  // Build source URL
  const handle = kol.handle.replace(/^@/, "");
  const sourceUrl =
    tweet.url || `https://twitter.com/${handle}/status/${tweet.id}`;

  // Generate title from first line or truncated text
  const firstLine = text.split("\n")[0];
  const title = truncate(firstLine, 80);

  // Confidence based on engagement
  const likes = tweet.favorite_count || 0;
  const retweets = tweet.retweet_count || 0;
  const engagementScore = likes + retweets * 2;
  const confidence = Math.min(
    10,
    Math.max(1, Math.round(engagementScore / 1000) + 3)
  );

  const date = new Date(tweet.created_at).toISOString().split("T")[0];

  return {
    id: `tw-${kol.id}-${tweet.id}`,
    kolId: kol.id,
    title,
    content: text,
    sourceType: "twitter",
    sourceUrl,
    sentiment,
    asset,
    confidence,
    tags,
    category: sentiment === "neutral" ? "market-analysis" : "market-analysis",
    publishedAt: new Date(tweet.created_at).toISOString(),
    addedAt: now,
    engagement: {
      likes: tweet.favorite_count || 0,
      retweets: tweet.retweet_count || 0,
      replies: tweet.reply_count || 0,
    },
    marketResult: null,
  };
}

// ---------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------

async function loadKOLs(): Promise<KOL[]> {
  const raw = await fs.readFile(KOLS_FILE, "utf-8");
  return JSON.parse(raw);
}

async function saveRawTweets(
  handle: string,
  tweets: RawTweet[]
): Promise<string> {
  await fs.mkdir(RAW_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${handle}-${timestamp}.json`;
  const filepath = path.join(RAW_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(tweets, null, 2));
  return filepath;
}

async function appendOpinions(opinions: OpinionOutput[]): Promise<void> {
  // Group opinions by date
  const byDate = new Map<string, OpinionOutput[]>();
  for (const op of opinions) {
    const date = op.publishedAt.split("T")[0];
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(op);
  }

  await fs.mkdir(OPINIONS_DIR, { recursive: true });

  for (const [date, dateOpinions] of byDate) {
    const filepath = path.join(OPINIONS_DIR, `${date}.json`);
    let existing: OpinionOutput[] = [];
    try {
      const raw = await fs.readFile(filepath, "utf-8");
      existing = JSON.parse(raw);
    } catch {
      // File doesn't exist yet
    }

    // Deduplicate by opinion ID
    const existingIds = new Set(existing.map((o) => o.id));
    const newOps = dateOpinions.filter((o) => !existingIds.has(o.id));

    if (newOps.length === 0) {
      console.log(`  ${date}: no new opinions (all duplicates)`);
      continue;
    }

    const merged = [...existing, ...newOps];
    await fs.writeFile(filepath, JSON.stringify(merged, null, 2));
    console.log(
      `  ${date}: added ${newOps.length} new opinions (total: ${merged.length})`
    );
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(): {
  handle?: string;
  max: number;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  let handle: string | undefined;
  let max = DEFAULT_MAX_ITEMS;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--handle" && args[i + 1]) {
      handle = args[++i];
    } else if (args[i] === "--max" && args[i + 1]) {
      max = parseInt(args[++i], 10);
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  return { handle, max, dryRun };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { handle, max, dryRun } = parseArgs();

  console.log("=== KOL Finance - Twitter Scraper ===\n");

  // Load KOLs
  const allKols = await loadKOLs();
  const kols = handle
    ? allKols.filter(
        (k) =>
          k.handle.toLowerCase() === handle.toLowerCase() ||
          k.handle.toLowerCase() === handle.replace(/^@/, "").toLowerCase()
      )
    : allKols;

  if (kols.length === 0) {
    console.error(`No KOL found for handle: ${handle}`);
    console.log("Available handles:", allKols.map((k) => k.handle).join(", "));
    process.exit(1);
  }

  console.log(`KOLs to scrape: ${kols.map((k) => k.handle).join(", ")}`);
  console.log(`Max tweets per KOL: ${max}`);
  console.log(`Dry run: ${dryRun}\n`);

  // Scrape tweets
  const handles = kols.map((k) => k.handle);
  const rawTweets = await scrapeTweets(handles, max);

  if (rawTweets.length === 0) {
    console.log("No tweets found.");
    return;
  }

  // Group tweets by handle for raw saving
  const kolByHandle = new Map(
    kols.map((k) => [k.handle.replace(/^@/, "").toLowerCase(), k])
  );

  const tweetsByHandle = new Map<string, RawTweet[]>();
  for (const tweet of rawTweets) {
    const screenName = tweet.user?.screen_name?.toLowerCase() || "";
    if (!tweetsByHandle.has(screenName)) tweetsByHandle.set(screenName, []);
    tweetsByHandle.get(screenName)!.push(tweet);
  }

  // Save raw tweets
  console.log("\nSaving raw tweets...");
  for (const [screenName, tweets] of tweetsByHandle) {
    const filepath = await saveRawTweets(screenName, tweets);
    console.log(`  ${screenName}: ${tweets.length} tweets -> ${filepath}`);
  }

  // Convert to opinions
  console.log("\nConverting to opinions...");
  const opinions: OpinionOutput[] = [];

  for (const [screenName, tweets] of tweetsByHandle) {
    const kol = kolByHandle.get(screenName);
    if (!kol) {
      console.log(`  Skipping ${screenName} (no matching KOL)`);
      continue;
    }

    for (const tweet of tweets) {
      const opinion = tweetToOpinion(tweet, kol);
      // Skip neutral tweets with low engagement (likely noise)
      if (
        opinion.sentiment === "neutral" &&
        (opinion.engagement?.likes || 0) < 100
      ) {
        continue;
      }
      opinions.push(opinion);
    }
  }

  console.log(`\nGenerated ${opinions.length} opinions:`);
  const bullish = opinions.filter((o) => o.sentiment === "bullish").length;
  const bearish = opinions.filter((o) => o.sentiment === "bearish").length;
  const neutral = opinions.filter((o) => o.sentiment === "neutral").length;
  console.log(`  Bullish: ${bullish} | Bearish: ${bearish} | Neutral: ${neutral}`);

  if (dryRun) {
    console.log("\n[DRY RUN] Preview of opinions:\n");
    for (const op of opinions.slice(0, 5)) {
      console.log(`  ${op.sentiment.toUpperCase()} | ${op.kolId} | ${op.asset}`);
      console.log(`  ${op.title}`);
      console.log(`  ${op.sourceUrl}\n`);
    }
    console.log("Dry run complete. No opinions saved.");
    return;
  }

  // Save opinions
  console.log("\nSaving opinions...");
  await appendOpinions(opinions);

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
