// daily ayah helper logic
import rawLimits from '../data/ayahLimits.json';

export interface DailyAyahData
{
  globalNumber?: number;
  surah: number;
  surahNameEn: string;
  surahNameAr: string;
  numberInSurah: number;
  arabic: string;
  english: string;
}

export type AyahSource = 'api' | 'fallback' | 'static';

export interface DailyAyahCache
{
  dayKey: string;
  source: AyahSource;
  lastTried: number;
  ayah: DailyAyahData;
}

export const STORAGE_KEY = 'nusuk_daily_ayah_v1';
export const TOTAL_AYAHS = 6236;
export const MAX_ATTEMPTS = 5;
export const TIMEOUT_MS = 5000;
export const RETRY_FALLBACK_AFTER_MS = 3600000; // 1 hr wait before bugging the api again

export const limits = rawLimits;
export const fallbackList: DailyAyahData[] = [];

// last resort 5:2 so banner never goes blank
export const STATIC_5_2_FALLBACK: DailyAyahData =
{
  surah: 5,
  surahNameEn: "Al-Ma'idah",
  surahNameAr: "سُورَةُ المَائـِدَةِ",
  numberInSurah: 2,
  arabic: "وَتَعَاوَنُوا۟ عَلَى ٱلْبِرِّ وَٱلتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا۟ عَلَى ٱلْإِثْمِ وَٱلْعُدْوَٰنِ",
  english: "And cooperate in righteousness and piety, but do not cooperate in sin and aggression."
};

// 32-bit FNV-1a hash to turn date string into a solid prng seed
export function hashString(str: string): number
{
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

// mulberry32 gives clean randoms with zero bias
export function mulberry32(a: number): () => number
{
  return function ()
  {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// flip the day at 12 noon local time
export function getDayKey(now: Date = new Date()): string
{
  const d = new Date(now.getTime());
  if (d.getHours() < 12)
    d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// deterministic index for picking from array
export function seededIndex(dayKey: string, length: number): number
{
  if (length <= 0)
    return 0;
  const rng = mulberry32(hashString(dayKey));
  return Math.floor(rng() * length);
}

// pick a deterministic bunch of ayah numbers (1..6236)
export function seededCandidates(dayKey: string, count: number = MAX_ATTEMPTS): number[]
{
  const rng = mulberry32(hashString(dayKey));
  const candidates: number[] = [];
  while (candidates.length < count)
  {
    const num = Math.floor(rng() * TOTAL_AYAHS) + 1;
    if (!candidates.includes(num))
      candidates.push(num);
  }
  return candidates;
}

// grab stable pick from fallback list lazily imported only on api failure
export async function getFallbackAyah(dayKey: string): Promise<DailyAyahData>
{
  try
  {
    const mod = await import('../data/ayahs.json');
    const list = (mod.default || mod) as DailyAyahData[];
    if (!Array.isArray(list) || list.length === 0)
      return STATIC_5_2_FALLBACK;
    const idx = seededIndex(dayKey, list.length);
    return list[idx] || STATIC_5_2_FALLBACK;
  }
  catch
  {
    return STATIC_5_2_FALLBACK;
  }
}

// safe localstorage reader so incognito doesn't explode
export function readCachedAyah(): DailyAyahCache | null
{
  try
  {
    if (typeof window === 'undefined' || !window.localStorage)
      return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return null;
    const parsed = JSON.parse(raw) as DailyAyahCache;
    if (!parsed || typeof parsed !== 'object' || !parsed.dayKey || !parsed.ayah)
      return null;
    return parsed;
  }
  catch
  {
    return null;
  }
}

// safe localstorage writer
export function writeCachedAyah(cache: DailyAyahCache): void
{
  try
  {
    if (typeof window === 'undefined' || !window.localStorage)
      return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  }
  catch
  {
    // localstorage full or blocked
  }
}

// fetch single candidate from api with strict verification
export async function fetchCandidateAyah(
  globalNumber: number,
  signal?: AbortSignal
): Promise<DailyAyahData | null>
{
  try
  {
    const url = `https://api.alquran.cloud/v1/ayah/${globalNumber}/editions/quran-uthmani,en.sahih`;
    const res = await fetch(url, { signal });
    if (!res.ok)
      return null;
    const json = await res.json();
    if (json.code !== 200 || !Array.isArray(json.data))
      return null;

    const uthmani = json.data.find(
      (e: any) => e.edition?.identifier === 'quran-uthmani'
    );
    const sahih = json.data.find(
      (e: any) => e.edition?.identifier === 'en.sahih'
    );

    if (!uthmani || !sahih)
      return null;

    const arabic = (uthmani.text || '').trim();
    const english = (sahih.text || '').trim();

    if (!arabic || !english)
      return null;

    const numberInSurah = uthmani.numberInSurah;
    const surah = uthmani.surah?.number;
    const surahNameEn = uthmani.surah?.englishName || '';
    const surahNameAr = uthmani.surah?.name || '';

    // skip bismillah openers and letters
    if (numberInSurah === 1)
      return null;

    // check length bounds from config
    if (arabic.length < limits.arabicMin || arabic.length > limits.arabicMax)
      return null;

    if (english.length > limits.englishMax)
      return null;

    return {
      globalNumber,
      surah,
      surahNameEn,
      surahNameAr,
      numberInSurah,
      arabic,
      english
    };
  }
  catch
  {
    return null;
  }
}

// longest allowed ayah (Surah Al-Jumu'a 62:10) for max capacity visual verification
export const LONGEST_ALLOWED_AYAH: DailyAyahData =
{
  surah: 62,
  surahNameEn: "Al-Jumu'a",
  surahNameAr: "سُورَةُ الجُمُعَةِ",
  numberInSurah: 10,
  arabic: "فَإِذَا قُضِيَتِ ٱلصَّلَوٰةُ فَٱنتَشِرُوا۟ فِى ٱلْأَرْضِ وَٱبْتَغُوا۟ مِن فَضْلِ ٱللَّهِ وَٱذْكُرُوا۟ ٱللَّهَ كَثِيرًۭا لَّعَلَّكُمْ تُفْلِحُونَ",
  english: "And when the prayer has been concluded, disperse within the land and seek from the bounty of Allah, and remember Allah often that you may succeed."
};

// main resolver pipeline
export async function resolveDailyAyah(
  now: Date = new Date()
): Promise<{ ayah: DailyAyahData; source: AyahSource }>
{
  // return the longest allowed ayah per user request so they can preview max capacity
  return { ayah: LONGEST_ALLOWED_AYAH, source: 'fallback' };
}
