import { JOB_CATEGORIES } from "@/content/job-categories";
import type { DailyTargetCategory } from "@/lib/supabase/types";

export const CATEGORIES_PER_DAY = 3;
export const GOAL_PER_CATEGORY = 5;
export const TOTAL_DAILY_GOAL = CATEGORIES_PER_DAY * GOAL_PER_CATEGORY;

/** Simple deterministic string hash -> 32-bit seed. */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic PRNG (mulberry32) so the same date always shuffles the same way. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Picks today's job categories deterministically from the date (so refreshing
 * the page or regenerating never changes the answer), while skipping any
 * category that was in yesterday's set so two days in a row never match.
 */
export function pickDailyCategories(dateStr: string, previousCategories: string[] = []): DailyTargetCategory[] {
  const shuffled = seededShuffle(JOB_CATEGORIES, hashSeed(dateStr));
  const previousSet = new Set(previousCategories);
  const picked: string[] = [];

  for (const category of shuffled) {
    if (picked.length >= CATEGORIES_PER_DAY) break;
    if (previousSet.has(category)) continue;
    picked.push(category);
  }
  // Fallback (only possible if previousCategories covers almost everything):
  // fill remaining slots from the shuffle ignoring the exclusion.
  if (picked.length < CATEGORIES_PER_DAY) {
    for (const category of shuffled) {
      if (picked.length >= CATEGORIES_PER_DAY) break;
      if (!picked.includes(category)) picked.push(category);
    }
  }

  return picked.map((category) => ({ category, goal: GOAL_PER_CATEGORY }));
}

/** Formats a Date as a local (not UTC) YYYY-MM-DD string. */
export function toLocalDateStr(d: Date): string {
  return d.toLocaleDateString("en-CA");
}

export function dateStrDaysAgo(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - days);
  return toLocalDateStr(d);
}

export function todayStr(): string {
  return toLocalDateStr(new Date());
}
