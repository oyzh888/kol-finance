import { NextRequest, NextResponse } from "next/server";
import { getKOLs, addKOL, deleteKOL } from "@/lib/data";

export async function GET() {
  const kols = await getKOLs();
  return NextResponse.json(kols);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const kol = {
    id: body.name.toLowerCase().replace(/\s+/g, "-"),
    name: body.name,
    handle: body.handle || `@${body.name.replace(/\s+/g, "")}`,
    avatar: body.avatar || body.name.slice(0, 2).toUpperCase(),
    bias: body.bias || "neutral",
    credibility: body.credibility || 50,
    tags: body.tags || [],
  };
  await addKOL(kol);
  return NextResponse.json(kol, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await deleteKOL(id);
  return NextResponse.json({ ok: true });
}
