import { prisma } from '@/lib/db/prisma';

interface ScoredMoment {
  postId: string;
  score: number;
}

export async function getRecommendedMomentIds(
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<{ ids: string[]; total: number }> {
  const [interests, following] = await Promise.all([
    prisma.userInterest.findMany({
      where: { userId },
      select: { category: true, weight: true },
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    }),
  ]);

  const interestMap = new Map<string, number>(interests.map(i => [i.category as string, i.weight]));
  const followingIds = new Set(following.map(f => f.followingId));

  const moments = await prisma.post.findMany({
    where: {
      compositeScore: { not: null },
      userId: { not: userId },
    },
    select: {
      id: true,
      userId: true,
      compositeScore: true,
      likeCount: true,
      viewCount: true,
      createdAt: true,
      place: { select: { category: true } },
    },
  });

  if (moments.length === 0) {
    return { ids: [], total: 0 };
  }

  const now = Date.now();
  const DAY_MS = 86400000;
  const maxEngagement = Math.max(...moments.map(m => m.likeCount + m.viewCount), 1);

  const scored: ScoredMoment[] = moments.map(m => {
    let score = 0;

    if (m.place?.category && interestMap.has(m.place.category as string)) {
      score += 3 * (interestMap.get(m.place.category as string) || 1);
    }

    if (followingIds.has(m.userId)) {
      score += 2;
    }

    const engagement = (m.likeCount + m.viewCount) / maxEngagement;
    score += engagement * 2;

    const ageMs = now - new Date(m.createdAt).getTime();
    const ageDays = ageMs / DAY_MS;
    score += Math.exp(-ageDays / 10);

    score += (m.compositeScore || 0) / 10;

    return { postId: m.id, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    ids: scored.slice(offset, offset + limit).map(s => s.postId),
    total: scored.length,
  };
}
