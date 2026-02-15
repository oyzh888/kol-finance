import { promises as fs } from "fs";
import path from "path";
import { KOL, Opinion, OpinionWithKOL } from "./types";

const DATA_DIR = path.join(process.cwd(), "..", "data");
const KOLS_FILE = path.join(DATA_DIR, "kols.json");
const OPINIONS_DIR = path.join(DATA_DIR, "opinions");

// --- KOLs ---

export async function getKOLs(): Promise<KOL[]> {
  const raw = await fs.readFile(KOLS_FILE, "utf-8");
  return JSON.parse(raw);
}

export async function getKOL(id: string): Promise<KOL | undefined> {
  const kols = await getKOLs();
  return kols.find((k) => k.id === id);
}

export async function addKOL(kol: KOL): Promise<void> {
  const kols = await getKOLs();
  kols.push(kol);
  await fs.writeFile(KOLS_FILE, JSON.stringify(kols, null, 2));
}

export async function updateKOL(
  id: string,
  updates: Partial<KOL>
): Promise<void> {
  const kols = await getKOLs();
  const idx = kols.findIndex((k) => k.id === id);
  if (idx === -1) throw new Error(`KOL ${id} not found`);
  kols[idx] = { ...kols[idx], ...updates };
  await fs.writeFile(KOLS_FILE, JSON.stringify(kols, null, 2));
}

export async function deleteKOL(id: string): Promise<void> {
  const kols = await getKOLs();
  const filtered = kols.filter((k) => k.id !== id);
  await fs.writeFile(KOLS_FILE, JSON.stringify(filtered, null, 2));
}

// --- Opinions ---

function opinionsFilePath(date: string): string {
  return path.join(OPINIONS_DIR, `${date}.json`);
}

export async function getOpinionsByDate(date: string): Promise<Opinion[]> {
  const filePath = opinionsFilePath(date);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addOpinion(date: string, opinion: any): Promise<void> {
  const opinions = await getOpinionsByDate(date);
  opinions.push(opinion);
  await fs.writeFile(opinionsFilePath(date), JSON.stringify(opinions, null, 2));
}

export async function deleteOpinion(
  date: string,
  opinionId: string
): Promise<void> {
  const opinions = await getOpinionsByDate(date);
  const filtered = opinions.filter((o) => o.id !== opinionId);
  await fs.writeFile(
    opinionsFilePath(date),
    JSON.stringify(filtered, null, 2)
  );
}

export async function getAvailableDates(): Promise<string[]> {
  try {
    const files = await fs.readdir(OPINIONS_DIR);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

// --- Combined ---

export async function getOpinionsWithKOLs(
  date: string
): Promise<OpinionWithKOL[]> {
  const [opinions, kols] = await Promise.all([
    getOpinionsByDate(date),
    getKOLs(),
  ]);
  const kolMap = new Map(kols.map((k) => [k.id, k]));
  return opinions
    .map((op) => ({
      ...op,
      kol: kolMap.get(op.kolId)!,
    }))
    .filter((op) => op.kol);
}
