"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Building2, 
  ArrowRight, 
  AlertCircle,
  Coins,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanItem {
  id: string;
  name: string;
  tier: "FREE" | "PRO" | "AGENCY" | "ENTERPRISE";
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  features: string[];
  badge?: string;
}

const PLANS: PlanItem[] = [
  {
    id: "free",
    name: "Free Community",
    tier: "FREE",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    description: "Ideal for solo creators getting started with social automation.",
    features: [
      "Up to 3 connected social channels",
      "30 scheduled posts per month",
      "50 Gemini AI credits monthly",
      "Standard 7-day analytics",
      "1 workspace",
    ],
  },
  {
    id: "pro",
    name: "Pro Creator",
    tier: "PRO",
    monthlyPrice: "$29",
    yearlyPrice: "$290",
    description: "For professional creators, influencers, and growing brands.",
    features: [
      "Up to 10 connected social channels",
      "Unlimited scheduled posts",
      "500 Gemini AI credits monthly",
      "Full 90-day analytics & CSV exports",
      "3 team member seats",
      "Up to 3 workspaces",
      "Public REST API access",
    ],
    badge: "Most Popular",
  },
  {
    id: "agency",
    name: "Agency & Studio",
    tier: "AGENCY",
    monthlyPrice: "$89",
    yearlyPrice: "$890",
    description: "Designed for marketing agencies managing multiple client brands.",
    features: [
      "Up to 30 connected social channels",
      "Unlimited scheduled posts",
      "2,500 Gemini AI credits monthly",
      "15 team member seats with role permissions",
      "10 workspaces & brand kits",
      "Post approval workflows",
      "365-day analytics retention",
      "Dedicated Dodo Customer Portal",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tier: "ENTERPRISE",
    monthlyPrice: "$299",
    yearlyPrice: "$2,990",
    description: "Custom enterprise infrastructure with dedicated compliance.",
    features: [
      "100+ connected social channels",
      "Unlimited scheduled posts & workspaces",
      "10,000 Gemini AI credits monthly",
      "50 team member seats",
      "Multi-year analytics retention",
      "Custom SLA & account manager",
    ],
  },
];

const CREDIT_PACKS = [
  { id: "500", credits: "500 AI Credits", price: "$10", perCredit: "$0.02/credit" },
  { id: "2000", credits: "2,000 AI Credits", price: "$30", perCredit: "$0.015/credit", popular: true },
];

export default function BillingPage() {
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBilling = async () => {
    try {
      const res = await fetch("/api/billing/subscription");
      if (res.ok) {
        const data = await res.json();
        setBillingData(data);
      }
    } catch (err) {
      console.error("Failed to load billing overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handlePlanCheckout = async (tier: "FREE" | "PRO" | "AGENCY" | "ENTERPRISE") => {
    if (tier === "FREE") return;
    setCheckoutLoading(tier);
    setErrorNotice(null);

    try {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          billingPeriod: selectedBillingCycle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorNotice(data.error || "Failed to initiate checkout session");
      } else if (data.checkoutUrl) {
        setNotice(`Dodo Payments Checkout Session initialized. Redirecting to checkout: ${data.checkoutUrl}`);
        window.open(data.checkoutUrl, "_blank");
      }
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to reach billing service");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleBuyCredits = async (packId: string) => {
    setCheckoutLoading(`pack-${packId}`);
    setErrorNotice(null);

    try {
      const res = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditPack: packId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorNotice(data.error || "Failed to initiate credit checkout");
      } else if (data.checkoutUrl) {
        setNotice(`Dodo Payments Checkout Session generated for ${packId} AI Credits. Redirecting...`);
        window.open(data.checkoutUrl, "_blank");
      }
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to purchase credit pack");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setPortalLoading(true);
    setErrorNotice(null);

    try {
      const res = await fetch("/api/billing/customer-portal", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorNotice(data.error || "Failed to generate customer portal session");
      } else if (data.portalUrl) {
        setNotice("Opening Dodo Payments Customer Billing Portal...");
        window.open(data.portalUrl, "_blank");
      }
    } catch (err: any) {
      setErrorNotice(err.message || "Portal request failed");
    } finally {
      setPortalLoading(false);
    }
  };

  const currentTier = billingData?.subscription?.tier || "FREE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Subscriptions & Billing</h1>
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
              Dodo Payments (test_mode)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription plan, buy one-time AI credits, and access your billing portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchBilling}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handleOpenCustomerPortal}
            disabled={portalLoading}
            className="gap-2 text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {portalLoading ? "Opening Portal..." : "Dodo Customer Portal"}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
          <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1">{notice}</div>
        </div>
      )}
      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorNotice}</div>
        </div>
      )}

      {/* Current Subscription Status */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Current Plan</span>
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  {billingData?.subscription?.status || "ACTIVE"}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {PLANS.find(p => p.tier === currentTier)?.name || "Free Community Plan"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Billing managed securely via Dodo Payments. Entitlements synchronized with live double-entry AI credit ledger.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-left sm:text-right">
                <div className="text-sm font-bold font-mono">
                  {currentTier === "FREE" ? "$0.00 / month" : `${billingData?.plan?.monthlyPriceUsd || 0}.00 / month`}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Available Credits: {billingData?.usage?.credits?.available ?? 50}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenCustomerPortal}
                className="text-xs bg-background"
              >
                Manage Invoices
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1 rounded-xl bg-muted border text-xs font-medium">
          <button
            onClick={() => setSelectedBillingCycle("MONTHLY")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedBillingCycle === "MONTHLY" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setSelectedBillingCycle("YEARLY")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedBillingCycle === "YEARLY" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Annual Billing
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">Save 17%</Badge>
          </button>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const price = selectedBillingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;
          const intervalLabel = selectedBillingCycle === "YEARLY" ? "/ year" : "/ month";

          return (
            <Card 
              key={plan.id}
              className={`flex flex-col relative transition-all duration-200 ${
                isCurrent 
                  ? "border-emerald-500 ring-1 ring-emerald-500 bg-card" 
                  : plan.badge 
                  ? "border-primary/40 shadow-sm" 
                  : "border-border"
              }`}
            >
              {plan.badge && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-xs min-h-[32px]">{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-extrabold">{price}</span>
                  <span className="text-xs text-muted-foreground ml-1">{plan.tier === "FREE" ? "forever" : intervalLabel}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 pb-6">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Included Features
                </div>
                <ul className="space-y-2 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button 
                  className="w-full text-xs font-semibold gap-1.5"
                  variant={isCurrent ? "outline" : plan.badge ? "default" : "secondary"}
                  disabled={isCurrent || checkoutLoading === plan.tier}
                  onClick={() => handlePlanCheckout(plan.tier)}
                >
                  {checkoutLoading === plan.tier ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating Checkout...
                    </>
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    <>
                      Upgrade to {plan.name}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* One-Time AI Credit Packs */}
      <div className="pt-6 border-t">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold tracking-tight">One-Time AI Credit Add-On Packs</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Non-expiring AI credits. Stored permanently in your organization ledger and consumed only after monthly allowances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <Card key={pack.id} className="border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    {pack.credits}
                    {pack.popular && <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">Best Value</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                    {pack.price} ({pack.perCredit})
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={checkoutLoading === `pack-${pack.id}`}
                  onClick={() => handleBuyCredits(pack.id)}
                  className="text-xs gap-1.5"
                >
                  {checkoutLoading === `pack-${pack.id}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      Buy Pack
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
