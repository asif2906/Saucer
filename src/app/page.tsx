import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlatformIcon } from "@/components/platform-icon";
import {
  Calendar,
  Sparkles,
  BarChart3,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  Globe2,
  Share2,
} from "lucide-react";

export default function LandingPage() {
  const platforms = [
    { name: "X (Twitter)", id: "x" },
    { name: "LinkedIn", id: "linkedin" },
    { name: "Instagram", id: "instagram" },
    { name: "Facebook", id: "facebook" },
    { name: "Threads", id: "threads" },
    { name: "YouTube", id: "youtube" },
    { name: "TikTok", id: "tiktok" },
    { name: "Pinterest", id: "pinterest" },
    { name: "Reddit", id: "reddit" },
    { name: "Bluesky", id: "bluesky" },
  ];

  const faqs = [
    {
      q: "What makes Saucer different from standard scheduling tools?",
      a: "Saucer provides a single centralized orbit for your entire brand presence. Compose once, tailor natively for 38+ platforms with live previews, schedule across timezones, and leverage Saucer AI for instant platform adaptations.",
    },
    {
      q: "How does Saucer AI operate?",
      a: "Saucer AI runs on Google's Gemini models. We manage the integration server-side, meaning you don't need to purchase or bring your own API keys. It handles caption generation, viral hooks, thread building, and tone rewriting within monthly plan allowances.",
    },
    {
      q: "Can I manage multiple client brands in Saucer?",
      a: "Yes. Saucer is built with strict multi-tenant workspace architecture. You can segment client accounts, invite team members with granular roles (Admin, Editor, Viewer), and manage shared calendars seamlessly.",
    },
    {
      q: "How does billing work?",
      a: "Saucer utilizes Dodo Payments as our exclusive global payment provider. We offer Free, Pro, and Agency plans, with self-service customer portal access for managing renewals, upgrades, and invoice receipts.",
    },
    {
      q: "Does Saucer support immediate publishing and visual scheduling?",
      a: "Yes. You can publish immediately across multiple networks simultaneously or schedule posts into custom visual queues, with drag-and-drop calendar rescheduling.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-violet-500/20">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-36 border-b bg-gradient-to-b from-background via-violet-950/[0.03] to-background">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Badge variant="purple" className="mb-6 py-1.5 px-3.5 text-xs font-semibold gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span>Next-Generation Social Media Architecture</span>
            </Badge>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              Your entire social presence. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                One platform.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Create, schedule, publish and manage all your social media from one powerful workspace, powered by Saucer AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="gradient" asChild className="w-full sm:w-auto text-base h-12 px-8">
                <Link href="/signup">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base h-12 px-8">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>

            {/* Platform Badges Carousel Strip */}
            <div className="mt-16 pt-8 border-t border-border/60">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6">
                Native integrations across major social networks
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
                {platforms.map((plat) => (
                  <div key={plat.id} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <PlatformIcon platform={plat.id} size={20} />
                    <span>{plat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT INTRODUCTION & LIVE WORKSPACE PREVIEW */}
        <section id="features" className="py-24 border-b bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-2">Centralized Command</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
                Designed for speed, clarity, and multi-network precision
              </p>
              <p className="text-muted-foreground">
                No more switching between dozens of separate browser tabs. Saucer centralizes creation, scheduling, team review, and analytics into one clean view.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-violet-600/10 text-violet-600 flex items-center justify-center mb-2">
                    <Layers className="w-5 h-5" />
                  </div>
                  <CardTitle>Unified Multi-Composer</CardTitle>
                  <CardDescription>
                    Write once, then customize captions individually for X, LinkedIn, Instagram, and Facebook with real-time character counters and live previews.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-purple-600/10 text-purple-600 flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <CardTitle>Interactive Visual Calendar</CardTitle>
                  <CardDescription>
                    Plan days, weeks, or months ahead. Drag and drop posts to reschedule instantly with automatic timezone awareness.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <CardTitle>Saucer AI Studio</CardTitle>
                  <CardDescription>
                    Generate viral hooks, multi-post threads, professional rewrites, and hashtag recommendations powered by Google Gemini.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* AI-POWERED CONTENT SECTION */}
        <section id="ai" className="py-24 border-b">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="purple" className="mb-4">Saucer AI Capabilities</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-6">
                  Intelligent content synthesis. Built directly into your composer.
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Never face writer's block again. Saucer AI transforms brief bullet points into platform-ready storytelling, adapts tone seamlessly, and suggests proven hashtags.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground text-sm">Cross-Platform Adaptation:</span>
                      <p className="text-xs text-muted-foreground">Adapts a long-form LinkedIn post into a concise X tweet and an Instagram visual caption in seconds.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground text-sm">Viral Thread Synthesis:</span>
                      <p className="text-xs text-muted-foreground">Generates structured 5–10 post storytelling arcs complete with hook, body, and CTA.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground text-sm">Tone & Style Shifting:</span>
                      <p className="text-xs text-muted-foreground">Toggle effortlessly between Professional, Casual, Bold, and Concise modes.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Visual AI Mock */}
              <div className="rounded-2xl border bg-card p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 mb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="font-bold text-sm">Saucer AI Generator</span>
                  </div>
                  <Badge variant="success">Free Tier Ready</Badge>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <span className="text-muted-foreground block mb-1">Prompt:</span>
                    <p className="font-medium text-foreground">"Announcement: We just launched Saucer AI for creators and agencies."</p>
                  </div>
                  <div className="p-3 rounded-lg bg-violet-600/5 border border-violet-500/20 space-y-2">
                    <div className="flex items-center justify-between text-violet-600 font-semibold">
                      <span>Generated for LinkedIn</span>
                      <span>3,000 char max</span>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      "Managing social distribution across 5+ platforms used to mean hours of tedious reformatting. Today, we're changing that with Saucer... 🚀"
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      <span className="text-violet-600 font-medium">#SocialMediaSaaS</span>
                      <span className="text-violet-600 font-medium">#CreatorEconomy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SUBSCRIPTION & PRICING PREVIEW (DODO PAYMENTS) */}
        <section id="pricing" className="py-24 border-b bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-2">Transparent Pricing</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
                Predictable plans. Built to scale with your brand.
              </p>
              <p className="text-muted-foreground">
                All subscriptions are billed securely via Dodo Payments Checkout Sessions with instant self-service management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* FREE */}
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg">Free</CardTitle>
                  <div className="my-3">
                    <span className="text-3xl font-extrabold">$0</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>
                  <CardDescription>For individuals starting out.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Up to 3 Social Channels</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 30 Scheduled Posts/mo</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 50 Free AI Credits/mo</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 1 Workspace</div>
                  <Button variant="outline" asChild className="w-full mt-4">
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* PRO */}
              <Card className="flex flex-col justify-between border-violet-500 shadow-md relative">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-violet-600 text-white font-bold text-[10px] uppercase tracking-wider">
                  Most Popular
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Pro</CardTitle>
                  <div className="my-3">
                    <span className="text-3xl font-extrabold">$29</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>
                  <CardDescription>For power creators and founders.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Up to 10 Social Channels</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Scheduled Posts</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 500 Monthly AI Credits</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 3 Workspaces / Brands</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 3 Team Member Seats</div>
                  <Button variant="gradient" asChild className="w-full mt-4">
                    <Link href="/signup">Upgrade to Pro</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* AGENCY */}
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg">Agency</CardTitle>
                  <div className="my-3">
                    <span className="text-3xl font-extrabold">$89</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>
                  <CardDescription>For growing marketing agencies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Up to 30 Social Channels</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Scheduled Posts</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 2,500 Monthly AI Credits</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 10 Client Workspaces</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 15 Team Members + Approval Flow</div>
                  <Button variant="outline" asChild className="w-full mt-4">
                    <Link href="/signup">Select Agency</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* ENTERPRISE */}
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-lg">Enterprise</CardTitle>
                  <div className="my-3">
                    <span className="text-3xl font-extrabold">Custom</span>
                  </div>
                  <CardDescription>For large organizations & networks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Channels</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Custom AI Credit Allowance</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Client Workspaces</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Dedicated Account Manager</div>
                  <Button variant="outline" asChild className="w-full mt-4">
                    <Link href="/signup">Contact Sales</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-24 border-b">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-2">Got Questions?</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Frequently Asked Questions
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-xl border bg-card/60">
                  <h3 className="font-semibold text-base text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-20 bg-gradient-to-tr from-violet-900 via-purple-900 to-indigo-900 text-white text-center">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Ready to take orbit?
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-8">
              Join creators and marketing teams scheduling and publishing across all their networks from one cohesive platform.
            </p>
            <Button size="lg" className="bg-white text-violet-950 hover:bg-white/90 text-base h-12 px-8 font-semibold" asChild>
              <Link href="/signup">
                Get Started with Saucer
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

