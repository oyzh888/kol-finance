export interface KOL {
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

export interface MarketCheckpoint {
  date: string;
  price: number;
  change: string;
}

export interface MarketResult {
  priceAtPost: number;
  currentPrice: number;
  priceChange: string;
  outcome: "correct" | "incorrect" | "pending" | "partial";
  checkpoints?: MarketCheckpoint[];
  finalVerified: boolean;
  verifiedAt: string | null;
}

export interface Engagement {
  likes?: number;
  retweets?: number;
  replies?: number;
}

export interface Opinion {
  id: string;
  kolId: string;
  title: string;
  content: string;
  sourceType: "twitter" | "blog" | "youtube" | "interview" | "newsletter";
  sourceUrl: string;
  archiveUrl?: string;
  sentiment: "bullish" | "bearish" | "neutral";
  asset: string;
  confidence: number;
  targetPrice?: number;
  timeframe?: string;
  tags: string[];
  category?: "price-prediction" | "risk-warning" | "market-analysis" | "trade-idea";
  publishedAt: string;
  addedAt?: string;
  marketResult?: MarketResult;
  engagement?: Engagement;
}

export interface OpinionWithKOL extends Opinion {
  kol: KOL;
}
