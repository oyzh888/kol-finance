import { NextResponse } from "next/server";
import stocksData from "@/data/stocks.json";

export async function GET() {
  return NextResponse.json(stocksData.stocks);
}
