import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { computeInterestAffinities, computeQualityScore, computeFreshnessScore } from './scoring';

const WEIGHTS = {
  interest: 3.0,
  social: 2.0,
  behavioral: 3.0,
  quality: 1.5,
  freshness: 1.0,
  discovery: 0.5,
};

const CATEGORY_TO_INTEREST: Record<string, string> = {
  RESTAURANT: 'FOOD_DRINK', CAFE: 'FOOD_DRINK', BAR: 'FOOD_DRINK',
  MUSEUM: 'ART_CULTURE', GALLERY: 'ART_CULTURE',
  PARK: 'OUTDOORS_NATURE', BEACH: 'OUTDOORS_NATURE', VIEWPOINT: 'OUTDOORS_NATURE',
  NIGHTCLUB: 'NIGHTLIFE',
  MARKET: 'SHOPPING', SHOP: 'SHOPPING',
  MONUMENT: 'HISTORY', LANDMARK: 'HISTORY',
  TOUR: 'ADVENTURE', ACTIVITY: 'ADVENTURE',
  HOTEL: 'RELAXATION', HOSTEL: 'RELAXATION',
  HIDDEN_GEM: 'LOCAL_EXPERIENCES',
};

interface ScoredMoment {
  momentId: string;
  score: number;
  factors: Record<string, number>;
}

export async function computeRecommendationsForUser(userId: string): Promise<ScoredMoment[]> {
  const [affinities, following] = await Promise.all([
    computeInterestAffinities(userId),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ]);

  const followingIds = new Set(following.map(f => f.followingId));

  // Cold start: if user has fewer than 10 events, use onboarding interests
  const eventCount = await prisma.userEvent.count({ where: { userId } });
  if (eventCount < 10) {
    const interests = await prisma.userInterest.findMany({
      where: { userId },
      select: { category: true, weight: true },
    });
    for (const interest of interests) {
      if (!affinities.has(interest.category)) {
        affinities.set(interest.category, interest.weight / 5);
      }
    }
  }

  const candidates = await prisma.post.findMany({
    where: { userId: { not: userId }, compositeScore: { not: null } },
    select: {
      id: true, userId: true, compositeScore: true,
      likeCount: true, viewCount: true, createdAt: true,
      place: { select: { category: true } },
      _count: { select: { saves: true } },
    },
  });

  if (candidates.length === 0) return [];

  const userViewSaveCounts = await prisma.userEvent.groupBy({
    by: ['eventType'],
    where: { userId, targetType: 'MOMENT', eventType: { in: ['VIEW', 'SAVE'] } },
    _count: true,
  });
  const viewCount = userViewSaveCounts.find(e => e.eventType === 'VIEW')?._count ?? 0;
  const saveCount = userViewSaveCounts.find(e => e.eventType === 'SAVE')?._count ?? 0;
  const globalSaveRate = viewCount > 0 ? saveCount / viewCount : 0.1;

  const allCategories = new Set(candidates.map(c => c.place?.category).filter(Boolean) as string[]);
  const seenCategories = new Set(affinities.keys());
  const unseenCategories = [...allCategories].filter(c => !seenCategories.has(c));

  const scored: ScoredMoment[] = [];

  for (const candidate of candidates) {
    const category = candidate.place?.category;
    const interestCategory = category ? CATEGORY_TO_INTEREST[category] : null;

    const interestScore = interestCategory && affinities.has(interestCategory)
      ? affinities.get(interestCategory)!
      : (category && affinities.has(category) ? affinities.get(category)! : 0);

    const socialScore = followingIds.has(candidate.userId) ? 0.5 : 0;
    const behavioralScore = interestScore > 0 ? interestScore * globalSaveRate * 10 : globalSaveRate;
    const ratingCount = [candidate.compositeScore].filter(x => x != null).length;
    const qualityScore = computeQualityScore(candidate.compositeScore, Math.max(ratingCount, candidate._count.saves));
    const freshnessScore = computeFreshnessScore(candidate.createdAt);
    const discoveryBoost = category && unseenCategories.includes(category) ? 1.0 : 0;

    const totalScore =
      WEIGHTS.interest * interestScore +
      WEIGHTS.social * socialScore +
      WEIGHTS.behavioral * behavioralScore +
      WEIGHTS.quality * qualityScore +
      WEIGHTS.freshness * freshnessScore +
      WEIGHTS.discovery * discoveryBoost;

    scored.push({
      momentId: candidate.id,
      score: totalScore,
      factors: { interest: interestScore, social: socialScore, behavioral: behavioralScore, quality: qualityScore, freshness: freshnessScore, discovery: discoveryBoost },
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export async function refreshRecommendationsForUser(userId: string): Promise<void> {
  const scored = await computeRecommendationsForUser(userId);
  if (scored.length === 0) return;

  await prisma.$transaction([
    prisma.recommendationScore.deleteMany({ where: { userId } }),
    prisma.recommendationScore.createMany({
      data: scored.map(s => ({
        userId,
        momentId: s.momentId,
        score: s.score,
        factors: s.factors as unknown as Prisma.InputJsonValue,
      })),
    }),
  ]);
}
