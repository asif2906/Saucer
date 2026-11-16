"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  ShieldAlert, 
  CreditCard, 
  Sparkles, 
  Globe, 
  Clock, 
  Check, 
  AlertTriangle,
  Lock,
  Mail,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "ai" | "notifications">("profile");

  // Profile Form State
  const [displayName, setDisplayName] = useState("Alex Mercer");
  const [email, setEmail] = useState("alex@saucer.app");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en-US");

  // Notification Toggles
  const [notifyPublishFail, setNotifyPublishFail] = useState(true);
  const [notifyPublishSuccess, setNotifyPublishSuccess] = useState(false);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(true);
  const [notifyCreditLow, setNotifyCreditLow] = useState(true);

  // AI & Privacy Toggles
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiAcknowledgeTerms, setAiAcknowledgeTerms] = useState(true);

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("Settings saved successfully.");
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account & System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal profile, notification preferences, AI privacy disclosures, and billing subscriptions.
          </p>
        </div>

        <Link href="/app/settings/billing">
          <Button variant="outline" className="gap-2 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
            <CreditCard className="h-3.5 w-3.5" />
            Manage Billing & Subscriptions
          </Button>
        </Link>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          {feedback}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b text-xs font-medium overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "profile"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "preferences"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          Preferences & Timezone
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "ai"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          AI & Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "notifications"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          Notifications
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">User Profile</CardTitle>
              <CardDescription className="text-xs">
                Your personal details used for authentication and team identification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    disabled
                    className="text-xs bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">Managed via Supabase Auth</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Tab 2: Preferences */}
      {activeTab === "preferences" && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Localization & Timezone</CardTitle>
              <CardDescription className="text-xs">
                Accurate timezones ensure scheduled posts dispatch at the intended local hour for your audience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">User Timezone</label>
                  <select
                    className="w-full text-xs h-9 px-3 rounded-md border bg-background"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="America/New_York">America/New_York (Eastern Time, UTC-5)</option>
                    <option value="America/Chicago">America/Chicago (Central Time, UTC-6)</option>
                    <option value="America/Denver">America/Denver (Mountain Time, UTC-7)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (Pacific Time, UTC-8)</option>
                    <option value="Europe/London">Europe/London (GMT/BST, UTC+0)</option>
                    <option value="Europe/Paris">Europe/Paris (CET, UTC+1)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST, UTC+9)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                    <option value="UTC">UTC (Universal Time Coordinated)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Interface Language</label>
                  <select
                    className="w-full text-xs h-9 px-3 rounded-md border bg-background"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Tab 3: AI & Privacy Disclosure */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base font-semibold">Google Gemini Free-Tier Data Disclosure</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Mandatory privacy disclosure per Saucer architectural guidelines and Google AI Studio terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-lg bg-background border space-y-2">
                <p className="font-semibold text-foreground">
                  How your prompts and data are handled:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>
                    Saucer operates exclusively on Google AI Studio unpaid free API tiers (Gemini 3.8 Flash & Gemini 3.5 Flash-Lite) with zero paid API infrastructure.
                  </li>
                  <li>
                    <strong>Important Privacy Disclosure:</strong> Under Google&apos;s unpaid service terms, Google may use submitted prompt inputs and model outputs for model training and product improvement, which may include review by human annotators.
                  </li>
                  <li>
                    <strong>Strict Guidance:</strong> Do not input passwords, credit card credentials, confidential client NDAs, personal identification numbers, or proprietary secrets into Saucer AI Studio.
                  </li>
                  <li>
                    Customer credit balances and reservation ledgers are maintained separately inside Saucer and are not transmitted to Google.
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="aiConsent"
                  checked={aiAcknowledgeTerms}
                  onChange={(e) => setAiAcknowledgeTerms(e.target.checked)}
                  className="rounded border-muted-foreground h-4 w-4"
                />
                <label htmlFor="aiConsent" className="text-xs font-medium cursor-pointer">
                  I understand the Google AI Studio unpaid tier terms and agree not to submit sensitive or confidential data.
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">AI Feature Availability Switch</CardTitle>
              <CardDescription className="text-xs">
                You can toggle AI caption and hashtag generation off for your workspace if your organization prohibits external AI model processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div>
                  <div className="text-xs font-semibold">Enable Saucer AI Studio</div>
                  <div className="text-[11px] text-muted-foreground">Allows members to request Gemini 3.8 Flash caption assistance</div>
                </div>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === "notifications" && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Email & In-App Notification Preferences</CardTitle>
              <CardDescription className="text-xs">
                Configure event alerts and automated digest dispatches.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  id: "notifyPublishFail",
                  title: "Publishing Failure Alert",
                  desc: "Immediate email notification if an API token expires or social platform rejects a post.",
                  state: notifyPublishFail,
                  setter: setNotifyPublishFail,
                },
                {
                  id: "notifyPublishSuccess",
                  title: "Post Dispatched Confirmation",
                  desc: "Receive confirmation when a post successfully publishes across connected channels.",
                  state: notifyPublishSuccess,
                  setter: setNotifyPublishSuccess,
                },
                {
                  id: "notifyWeeklyDigest",
                  title: "Weekly Performance Digest",
                  desc: "Weekly summary of impressions, follower growth, and top-performing content.",
                  state: notifyWeeklyDigest,
                  setter: setNotifyWeeklyDigest,
                },
                {
                  id: "notifyCreditLow",
                  title: "AI Quota & Credit Alerts",
                  desc: "Notification when monthly free-tier credit balance falls below 10 credits.",
                  state: notifyCreditLow,
                  setter: setNotifyCreditLow,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="pr-4">
                    <div className="text-xs font-semibold">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="h-4 w-4 rounded border-muted-foreground shrink-0"
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                Save Notifications
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-xs">
            Irreversible account and workspace actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-destructive/20">
            <div>
              <div className="font-semibold text-foreground">Purge Workspace Content</div>
              <div className="text-muted-foreground text-[11px]">Delete all scheduled drafts, published history, and media from this workspace.</div>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs">
              Purge Workspace
            </Button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold text-foreground">Delete Account</div>
              <div className="text-muted-foreground text-[11px]">Permanently remove your user profile and all associated data across Saucer.</div>
            </div>
            <Button variant="destructive" size="sm" className="text-xs">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

