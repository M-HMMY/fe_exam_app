import type { AppState, AttemptLog } from '../types';
import { CATEGORIES } from '../data/categories';

export interface CategoryStat {
  categoryId: string;
  total: number;
  correct: number;
  /** 0〜1。未解答は null */
  rate: number | null;
}

/** 分野ごとの正答率。同じ問題を複数回解いた場合はすべて集計に含める */
export function statsByCategory(logs: AttemptLog[]): CategoryStat[] {
  const map = new Map<string, { total: number; correct: number }>();
  for (const c of CATEGORIES) map.set(c.id, { total: 0, correct: 0 });
  for (const log of logs) {
    const entry = map.get(log.categoryId) ?? { total: 0, correct: 0 };
    entry.total += 1;
    if (log.correct) entry.correct += 1;
    map.set(log.categoryId, entry);
  }
  return CATEGORIES.map((c) => {
    const e = map.get(c.id)!;
    return { categoryId: c.id, total: e.total, correct: e.correct, rate: e.total ? e.correct / e.total : null };
  });
}

/** 直近 n 件の正答率 */
export function recentAccuracy(logs: AttemptLog[], n = 50): { total: number; correct: number; rate: number | null } {
  const recent = logs.slice(-n);
  const correct = recent.filter((l) => l.correct).length;
  return { total: recent.length, correct, rate: recent.length ? correct / recent.length : null };
}

/** 解答数が閾値以上で正答率が低い分野を弱点として返す */
export function weakCategories(logs: AttemptLog[], minAnswers = 3, limit = 3): CategoryStat[] {
  return statsByCategory(logs)
    .filter((s) => s.total >= minAnswers && s.rate !== null && s.rate < 0.8)
    .sort((a, b) => (a.rate! - b.rate!) || b.total - a.total)
    .slice(0, limit);
}

/** 日別の解答数（直近 days 日、古い順） */
export function dailyCounts(logs: AttemptLog[], days = 14, now = Date.now()): { label: string; count: number }[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const result: { label: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(start.getTime() - i * 86400000);
    const next = day.getTime() + 86400000;
    const count = logs.filter((l) => l.at >= day.getTime() && l.at < next).length;
    result.push({ label: `${day.getMonth() + 1}/${day.getDate()}`, count });
  }
  return result;
}

/** 連続学習日数 */
export function streakDays(logs: AttemptLog[], now = Date.now()): number {
  if (logs.length === 0) return 0;
  const daySet = new Set(
    logs.map((l) => {
      const d = new Date(l.at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }),
  );
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = today.getTime();
  // 今日まだ解いていない場合は昨日から数える
  if (!daySet.has(cursor)) cursor -= 86400000;
  while (daySet.has(cursor)) {
    streak += 1;
    cursor -= 86400000;
  }
  return streak;
}

/** 教本の読了率 */
export function readingProgress(state: AppState, totalSections: number): number {
  if (totalSections === 0) return 0;
  return state.readSections.length / totalSections;
}
