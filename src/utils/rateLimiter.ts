// rateLimiter.ts
const reviewTimestamps = new Map<string, number>();

export const canPostReview = (userId: number, cooldown = 60 * 1000) => {
  const now = Date.now();
  const lastPostTime = reviewTimestamps.get(userId.toString());

  if (lastPostTime && now - lastPostTime < cooldown) {
    return false;
  }

  reviewTimestamps.set(userId.toString(), now);
  return true;
};
