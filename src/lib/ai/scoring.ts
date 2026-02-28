import { prisma } from '@/lib/db/prisma';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 86400000;

/**
 * Compute dynamic interest affinities from behavioral events (last 30 days).
 * Returns a map of category -> affinity score (0-1).
 */
export async function computeInterestAffinities(userId: string): Promise<Map<string, number>> {
  const since = new Date(Date.now() - THIRTY_DAYS_MS);

  const events = await prisma.userEvent.findMany({
    where: {
      userId,
      eventType: { in: ['VIEW', 'SAVE', 'LIKE'] },
      targetType: 'MOMENT',
      createdAt: { gte: since },
    },
    select: { eventType: true, targetId: true, createdAt: true },
  });

  if (events.length === 0) return new Map();

  const momentIds = [...new Set(events.filter(e => e.targetId).map(e => e.targetId!))];
  const moments = await prisma.post.findMany({
    where: { id: { in: momentIds } },
    select: { id: true, place: { select: { category: true } } },
  });

  const momentCategoryMap = new Map<string, string>();
  for (const m of moments) {
    if (m.place?.category) momentCategoryMap.set(m.id, m.place.category);
  }

  const weights: Record<string, number> = { SAVE: 3, LIKE: 2, VIEW: 1 };
  const categoryScores = new Map<string, number>();

  for (const event of events) {
    if (!event.targetId) continue;
    const category = momentCategoryMap.get(event.targetId);
    if (!category) continue;

    const ageMs = Date.now() - new Date(event.createdAt).getTime();
    const decay = Math.exp(-ageMs / (THIRTY_DAYS_MS / 2));
    const weight = (weights[event.eventType] ?? 1) * decay;
    categoryScores.set(category, (categoryScores.get(category) ?? 0) + weight);
  }

  const maxScore = Math.max(...categoryScores.values(), 1);
  const affinities = new Map<string, number>();
  for (const [cat, score] of categoryScores) {
    affinities.set(cat, score / maxScore);
  }
  return affinities;
}

export function computeQualityScore(compositeScore: number | null, ratingCount: number): number {
  if (compositeScore == null) return 0;
  const confidence = Math.min(ratingCount / 5, 1);
  return (compositeScore / 10) * confidence;
}

export function computeFreshnessScore(createdAt: Date): number {
  const ageDays = (Date.now() - createdAt.getTime()) / DAY_MS;
  const decay = Math.exp(-ageDays / 14);
  const boost = ageDays < 2 ? 1.5 : 1;
  return decay * boost;
}
