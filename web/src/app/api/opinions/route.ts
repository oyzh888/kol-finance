import { NextRequest, NextResponse } from "next/server";
import {
  getOpinionsWithKOLs,
  addOpinion,
  deleteOpinion,
  getAvailableDates,
} from "@/lib/data";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (date === "dates") {
    const dates = await getAvailableDates();
    return NextResponse.json(dates);
  }
  const targetDate = date || new Date().toISOString().split("T")[0];
  const opinions = await getOpinionsWithKOLs(targetDate);
  return NextResponse.json(opinions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const date = body.date || new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opinion: any = {
    id: `op-${date}-${Date.now()}`,
    kolId: body.kolId,
    title: body.title,
    content: body.content,
    sourceType: body.sourceType || "twitter",
    sourceUrl: body.sourceUrl || "",
    sentiment: body.sentiment,
    asset: body.asset || "BTC",
    confidence: body.confidence || 5,
    tags: body.tags || [],
    category: body.category || "market-analysis",
    publishedAt: now,
    addedAt: now,
  };

  if (body.targetPrice) opinion.targetPrice = body.targetPrice;
  if (body.archiveUrl) opinion.archiveUrl = body.archiveUrl;

  if (body.priceAtPost) {
    opinion.marketResult = {
      priceAtPost: body.priceAtPost,
      currentPrice: body.priceAtPost,
      priceChange: "0.00%",
      outcome: "pending",
      checkpoints: [],
      finalVerified: false,
      verifiedAt: null,
    };
  }

  await addOpinion(date, opinion);
  return NextResponse.json(opinion, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { date, id } = await req.json();
  await deleteOpinion(date, id);
  return NextResponse.json({ ok: true });
}
