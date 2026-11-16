"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Building2, 
  ArrowRight, 
  Download,
  AlertCircle,
  Clock,
  Coins
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanItem {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  dodoProductId?: string;
  badge?: string;
}

const PLANS: PlanItem[] = [
  {
    id: "free",
    name: "Free Community",
    price: "$0",
    period: "forever",
    description: "Ideal for solo creators and hobbyists getting started.",
    features: [
      "Up to 3 connected social channels",
      "30 scheduled posts per month",
      "Gemini 3.5 Flash-Lite AI (10 credits/mo)",
      "Standard 7-day analytics",
      "1 workspace",
    ],
    isCurrent: true,
  },
  {
    id: "pro",
    name: "Pro Creator",
    price: "$29",
    period: "per month",
    description: "For professional creators, influencers, and growing brands.",
    features: [
      "Up to 15 connected social channels",
      "Unlimited scheduled posts",
      "Gemini 3.8 Flash AI (500 credits/mo)",
      "Full 90-day analytics & CSV exports",
      "3 team member seats",
      "Up to 3 workspaces",
      "RSS to Social autoposting",
    ],
    dodoProductId: "p_dodo_pro_monthly",
    badge: "Most Popular",
  },
  {
    id: "agency",
    name: "Agency & Studio",
    price: "$89",
    period: "per month",
    description: "Designed for social media agencies managing multiple client brands.",
    features: [
      "Up to 50 connected social channels",
      "Unlimited scheduled posts",
      "Gemini 3.8 Flash AI (2,000 credits/mo)",
      "10 team member seats with role permissions",
      "Unlimited workspaces & brand kits",
      "Outgoing webhooks & automation triggers",
      "Priority queue dispatch",
    ],
    dodoProductId: "p_dodo_agency_monthly",
  },
];

const CREDIT_PACKS = [
  { id: "pack-100", credits: "100 AI Credits", price: "$5", perCredit: "$0.05/credit", dodoPackId: "p_dodo_pack_100" },
  { id: "pack-500", credits: "500 AI Credits", price: "$20", perCredit: "$0.04/credit", dodoPackId: "p_dodo_pack_500", popular: true },
  { id: "pack-1500", credits: "1,500 AI Credits", price: "$50", perCredit: "$0.033/credit", dodoPackId: "p_dodo_pack_1500" },
];

const INVOICE_HISTORY = [
  { id: "inv_001", date: "Nov 01, 2026", amount: "$0.00", plan: "Free Community Plan", status: "Paid", receipt: "#" },
];

export default function BillingPage() {
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handlePlanCheckout = (planId: string) => {
    setCheckoutLoading(planId);
    // Simulates server-side Dodo Payments Checkout Session generation
    setTimeout(() => {
      setCheckoutLoading(null);
      setNotice(`Dodo Payments Checkout Session initiated for plan: ${planId.toUpperCase()} (test_mode). In production, this securely redirects to checkout.dodopayments.com.`);
      setTimeout(() => setNotice(null), 6000);
    }, 800);
  };

  const handleBuyCredits = (packId: string) => {
    setCheckoutLoading(packId);
    setTimeout(() => {
      setCheckoutLoading(null);
      setNotice(`Dodo Payments Checkout Session generated for Credit Pack (${packId}) in test_mode. Credits will settle into ledger upon webhook receipt.`);
      setTimeout(() => setNotice(null), 6000);
    }, 800);
  };

  const handleOpenCustomerPortal = () => {
    setPortalLoading(true);
    setTimeout(() => {
      setPortalLoading(false);
      setNotice("Dodo Customer Billing Portal session created. Redirecting to hosted customer management session.");
      setTimeout(() => setNotice(null), 5000);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Subscriptions & Billing</h1>
            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
              Dodo Payments (test_mode)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your workspace subscription tier, purchase one-time AI credit packs, and review billing invoices.
          </p>
        </div>

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

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
          <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div>{notice}</div>
        </div>
      )}

      {/* Current Subscription Card */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Current Plan</span>
                <Badge className="bg-emerald-600 text-white text-[10px]">Active</Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Free Community Plan</h2>
              <p className="text-xs text-muted-foreground">
                Renews automatically each month. Entitlements managed securely via verified server-side Dodo webhook events.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-left sm:text-right">
                <div className="text-sm font-bold font-mono">$0.00 / month</div>
                <div className="text-[11px] text-muted-foreground">Next reset: Dec 01, 2026</div>
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

      {/* Subscription Plans Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Available Subscription Plans</h2>
          <p className="text-xs text-muted-foreground">
            Upgrade seamlessly via Dodo Payments Checkout Sessions with instant entitlement synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col justify-between ${
                plan.badge ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/30" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white text-[10px] px-2.5 py-0.5 shadow-sm">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">{plan.name}</CardTitle>
                <CardDescription className="text-xs min-h-[32px]">{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground ml-1.5 font-normal">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5 text-xs flex-1">
                <div className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Features included:</div>
                <ul className="space-y-2">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4 border-t">
                {plan.isCurrent ? (
                  <Button variant="outline" disabled className="w-full text-xs">
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                    disabled={checkoutLoading === plan.id}
                    onClick={() => handlePlanCheckout(plan.id)}
                  >
                    {checkoutLoading === plan.id ? "Initiating Checkout..." : `Upgrade to ${plan.name.split(" ")[0]}`}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* One-Time AI Credit Packs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle className="text-base font-semibold">One-Time AI Credit Add-Ons</CardTitle>
              <CardDescription className="text-xs">
                Need extra Gemini caption generations without upgrading your base tier? Purchase perpetual bonus credits.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CREDIT_PACKS.map((pack) => (
              <div 
                key={pack.id} 
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  pack.popular ? "border-amber-500/50 bg-amber-500/5" : "bg-muted/20"
                }`}
              >
                <div>
                  {pack.popular && (
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400 mb-1.5">
                      Best Value
                    </Badge>
                  )}
                  <div className="font-bold text-sm text-foreground">{pack.credits}</div>
                  <div className="text-[11px] text-muted-foreground">{pack.perCredit}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-lg font-bold font-mono">{pack.price}</span>
                  <Button
                    size="sm"
                    variant={pack.popular ? "default" : "outline"}
                    className={pack.popular ? "bg-amber-600 hover:bg-amber-500 text-white text-xs h-8" : "text-xs h-8"}
                    disabled={checkoutLoading === pack.id}
                    onClick={() => handleBuyCredits(pack.id)}
                  >
                    {checkoutLoading === pack.id ? "Processing..." : "Purchase"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 mt-4 p-3 rounded-lg bg-muted/40 border text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <div>
              <strong>Atomic Credit Ledger Architecture:</strong> Purchased credits are deposited into the user&apos;s Saucer internal ledger upon verified <code className="font-mono text-xs">payment.succeeded</code> webhook signature validation. Credits do not expire at monthly billing resets.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice & Payment History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Payment History & Receipts</CardTitle>
          <CardDescription className="text-xs">
            Official tax invoices and payment receipts generated by Dodo Payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-3 font-medium">Invoice ID</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {INVOICE_HISTORY.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="py-3 font-mono text-muted-foreground">{inv.id}</td>
                    <td className="py-3 whitespace-nowrap">{inv.date}</td>
                    <td className="py-3 font-medium text-foreground">{inv.plan}</td>
                    <td className="py-3 font-mono">{inv.amount}</td>
                    <td className="py-3">
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dodo Payments Compliance & Security Disclaimer */}
      <div className="p-4 rounded-xl border bg-muted/20 text-xs text-muted-foreground space-y-1.5">
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          PCI-DSS Compliant Payment Infrastructure
        </div>
        <p>
          Payment processing and checkout operations are powered exclusively by <strong>Dodo Payments</strong>. 
          Saucer never handles, stores, or transmits credit card numbers or banking secrets. 
          Entitlements are strictly synchronized via verified webhook events (<code className="font-mono">payment.succeeded</code>, <code className="font-mono">subscription.renewed</code>, <code className="font-mono">subscription.cancelled</code>).
        </p>
      </div>
    </div>
  );
}

