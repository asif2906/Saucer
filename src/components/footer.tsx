import React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 text-muted-foreground text-sm">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2">
            <Logo href="/" size="md" className="mb-4" />
            <p className="text-muted-foreground max-w-sm mb-4">
              A centralized orbit for social media management. Create, schedule, publish, and analyze your brand across 38+ platforms from one cohesive dashboard.
            </p>
            <div className="text-xs text-muted-foreground/80">
              © {new Date().getFullYear()} Saucer HQ Inc. All rights reserved.
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Multi-Composer
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Visual Calendar
                </Link>
              </li>
              <li>
                <Link href="#ai" className="hover:text-foreground transition-colors">
                  Saucer AI
                </Link>
              </li>
              <li>
                <Link href="#integrations" className="hover:text-foreground transition-colors">
                  Social Channels
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/app" className="hover:text-foreground transition-colors">
                  Web Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Agency Portal
                </Link>
              </li>
              <li>
                <Link href="/app/settings/billing" className="hover:text-foreground transition-colors">
                  Billing (Dodo Payments)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">
              Compliance & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-xs text-muted-foreground block leading-relaxed mt-2 pt-2 border-t">
                  Derived with reference to Postiz under AGPL-3.0. Source code access available under open-source compliance.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>Designed and built for high-growth creators, startups, and marketing agencies worldwide.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

