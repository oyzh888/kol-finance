import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

interface Opinion {
  id: string;
  stockTicker: string;
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  const stock = req.nextUrl.searchParams.get("stock")?.toUpperCase();
  
  // Load JSON at runtime to avoid bundler caching
  const opinionsPath = join(process.cwd(), "src/data/opinions.json");
  const opinionsData: Opinion[] = JSON.parse(readFileSync(opinionsPath, "utf-8"));
  
  let opinions = opinionsData;
  if (stock) {
    opinions = opinionsData.filter((op: Opinion) => op.stockTicker === stock);
  }
  
  return NextResponse.json(opinions);
}
