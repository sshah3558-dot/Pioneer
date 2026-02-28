import { prisma } from '@/lib/db/prisma';

export function computeCompositeScore(
  overall: number,
  value?: number | null,
  authenticity?: number | null,
  crowd?: number | null,
): number {
  const clamp = (n: number) => Math.min(5, Math.max(1, n));
  const o = clamp(overall);
  const v = clamp(value ?? overall);
  const a = clamp(authenticity ?? overall);
  const c = clamp(crowd ?? overall);
  const raw = o * 0.4 + v * 0.2 + a * 0.2 + c * 0.2;
  return Math.round(raw * 2 * 10) / 10;
}

export async function recomputeUserRanks(userId: string): Promise<void> {
  const moments = await prisma.post.findMany({
    where: { userId, compositeScore: { not: null } },
    orderBy: { compositeScore: 'desc' },
    select: { id: true },
  });

  await prisma.$transaction(
    moments.map((m, i) =>
      prisma.post.update({
        where: { id: m.id },
        data: { rank: i + 1 },
      })
    )
  );
}

export function getScoreColor(score: number): string {
  if (score >= 8.0) return 'bg-green-600';
  if (score >= 6.0) return 'bg-lime-500';
  if (score >= 4.0) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getScoreHex(score: number): string {
  if (score >= 8.0) return '#16A34A';
  if (score >= 6.0) return '#84CC16';
  if (score >= 4.0) return '#F59E0B';
  return '#EF4444';
}
