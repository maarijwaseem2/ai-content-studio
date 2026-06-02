/** Monthly credit allowance per subscription tier (must match backend). */
export const TIER_CREDITS: Record<string, number> = {
  FREE: 250,
  STARTER: 250,
  PRO: 1000,
  BUSINESS: 5000,
};

export function getCreditLimit(
  credits: number,
  subscriptionTier: string | null | undefined,
  creditLimit?: number | null,
): number {
  const tier = subscriptionTier?.toUpperCase() || "FREE";
  const tierLimit = TIER_CREDITS[tier] ?? 250;
  const stored = creditLimit && creditLimit > 0 ? creditLimit : tierLimit;
  return Math.max(stored, credits);
}
