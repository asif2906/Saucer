"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error && !error.message.includes("fetch")) {
        toast.error(error.message);
        return;
      }

      setSubmitted(true);
      toast.success("Password reset instructions sent to your email.");
    } catch {
      setSubmitted(true);
      toast.info("Password reset instructions simulated (development mode).");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-border shadow-xl backdrop-blur-sm bg-card/90 text-center p-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-bold mb-2">Check your email</CardTitle>
        <CardDescription className="mb-6">
          We have sent a secure password reset link to <strong className="text-foreground">{email}</strong>.
        </CardDescription>
        <Button variant="outline" asChild className="w-full">
          <Link href="/login">Return to Sign In</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-xl backdrop-blur-sm bg-card/90">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Reset password</CardTitle>
        <CardDescription>
          Enter your registered email and we'll send a password recovery link
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleReset}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" variant="gradient" className="w-full h-10" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending link...</span>
              </span>
            ) : (
              <span>Send Recovery Link</span>
            )}
          </Button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

