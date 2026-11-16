import { SubscriptionTier, BillingInterval } from "@prisma/client";

export interface PlanEntitlements {
  tier: SubscriptionTier;
  displayName: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number;
  connectedChannels: number; // -1 for unlimited
  workspaces: number;
  teamMembers: number;
  monthlyPosts: number; // -1 for unlimited
  monthlyAiCredits: number;
  analyticsRetentionDays: number;
  maxWebhooks: number;
  approvalWorkflows: boolean;
  publicApi: boolean;
  customerPortalAllowed: boolean;
  dodoProductMonthly: string | null;
  dodoProductYearly: string | null;
}

export interface CreditPackConfig {
  id: string;
  creditAmount: number;
  priceUsd: number;
  displayName: string;
}

export const CREDIT_PACKS: Record<string, CreditPackConfig> = {
  "500": {
    id: "pdt_credits_500",
    creditAmount: 500,
    priceUsd: 10,
    displayName: "500 AI Credits",
  },
  "2000": {
    id: "pdt_credits_2000",
    creditAmount: 2000,
    priceUsd: 30,
    displayName: "2,000 AI Credits",
  },
};

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, PlanEntitlements> = {
  FREE: {
    tier: SubscriptionTier.FREE,
    displayName: "Free",
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    connectedChannels: 3,
    workspaces: 1,
    teamMembers: 1,
    monthlyPosts: 30,
    monthlyAiCredits: 50,
    analyticsRetentionDays: 7,
    maxWebhooks: 0,
    approvalWorkflows: false,
    publicApi: false,
    customerPortalAllowed: false,
    dodoProductMonthly: null,
    dodoProductYearly: null,
  },
  PRO: {
    tier: SubscriptionTier.PRO,
    displayName: "Pro",
    monthlyPriceUsd: 29,
    yearlyPriceUsd: 290,
    connectedChannels: 10,
    workspaces: 3,
    teamMembers: 3,
    monthlyPosts: -1, // Unlimited
    monthlyAiCredits: 500,
    analyticsRetentionDays: 90,
    maxWebhooks: 3,
    approvalWorkflows: false,
    publicApi: true,
    customerPortalAllowed: true,
    dodoProductMonthly: process.env.DODO_PRODUCT_PRO_MONTHLY || "pdt_pro_monthly",
    dodoProductYearly: process.env.DODO_PRODUCT_PRO_YEARLY || "pdt_pro_yearly",
  },
  AGENCY: {
    tier: SubscriptionTier.AGENCY,
    displayName: "Agency",
    monthlyPriceUsd: 89,
    yearlyPriceUsd: 890,
    connectedChannels: 30,
    workspaces: 10,
    teamMembers: 15,
    monthlyPosts: -1, // Unlimited
    monthlyAiCredits: 2500,
    analyticsRetentionDays: 365,
    maxWebhooks: 20,
    approvalWorkflows: true,
    publicApi: true,
    customerPortalAllowed: true,
    dodoProductMonthly: process.env.DODO_PRODUCT_AGENCY_MONTHLY || "pdt_agency_monthly",
    dodoProductYearly: process.env.DODO_PRODUCT_AGENCY_YEARLY || "pdt_agency_yearly",
  },
  ENTERPRISE: {
    tier: SubscriptionTier.ENTERPRISE,
    displayName: "Enterprise",
    monthlyPriceUsd: 299,
    yearlyPriceUsd: 2990,
    connectedChannels: 100,
    workspaces: 50,
    teamMembers: 50,
    monthlyPosts: -1, // Unlimited
    monthlyAiCredits: 10000,
    analyticsRetentionDays: 730,
    maxWebhooks: 100,
    approvalWorkflows: true,
    publicApi: true,
    customerPortalAllowed: true,
    dodoProductMonthly: process.env.DODO_PRODUCT_ENTERPRISE_MONTHLY || "pdt_enterprise_custom",
    dodoProductYearly: process.env.DODO_PRODUCT_ENTERPRISE_YEARLY || "pdt_enterprise_custom",
  },
};

export function getPlanConfig(tier: SubscriptionTier): PlanEntitlements {
  return SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.FREE;
}

export function getProductIdForTier(tier: SubscriptionTier, interval: BillingInterval): string | null {
  const plan = getPlanConfig(tier);
  return interval === BillingInterval.YEARLY ? plan.dodoProductYearly : plan.dodoProductMonthly;
}

export function getTierFromProductId(productId: string): {
  tier: SubscriptionTier;
  interval: BillingInterval;
} | null {
  for (const [tierKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.dodoProductMonthly === productId) {
      return { tier: tierKey as SubscriptionTier, interval: BillingInterval.MONTHLY };
    }
    if (plan.dodoProductYearly === productId) {
      return { tier: tierKey as SubscriptionTier, interval: BillingInterval.YEARLY };
    }
  }
  return null;
}
