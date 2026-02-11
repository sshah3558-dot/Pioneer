import { prisma } from '@/lib/db/prisma';

/**
 * Update aggregated ratings for a place based on all its reviews
 */
export async function updatePlaceRatings(placeId: string) {
  const reviews = await prisma.review.findMany({
    where: { placeId },
    select: {
      overallRating: true,
      valueRating: true,
      authenticityRating: true,
      crowdRating: true,
    },
  });

  const count = reviews.length;
  if (count === 0) {
    await prisma.place.update({
      where: { id: placeId },
      data: {
        avgOverallRating: null,
        avgValueRating: null,
        avgAuthenticityRating: null,
        avgCrowdRating: null,
        totalReviewCount: 0,
      },
    });
    return;
  }

  const avg = (arr: (number | null)[]): number | null => {
    const valid = arr.filter((n): n is number => n !== null);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };

  await prisma.place.update({
    where: { id: placeId },
    data: {
      avgOverallRating: avg(reviews.map(r => r.overallRating)),
      avgValueRating: avg(reviews.map(r => r.valueRating)),
      avgAuthenticityRating: avg(reviews.map(r => r.authenticityRating)),
      avgCrowdRating: avg(reviews.map(r => r.crowdRating)),
      totalReviewCount: count,
    },
  });
}
