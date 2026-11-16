"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, User, Building2, Loader2, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            organization_name: orgName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        toast.error(error.message);
        return;
      }

      // If Supabase requires email verification, session is null
      if (data.user && !data.session) {
        setEmailVerificationSent(true);
        toast.success("Confirmation email dispatched! Please verify your inbox.");
        return;
      }

      if (data.session) {
        toast.success("Account created successfully! Welcome to Saucer.");
        router.push("/app");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailVerificationSent) {
    return (
      <Card className="border-border shadow-xl backdrop-blur-sm bg-card/90 text-center p-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-bold mb-2">Verify your email address</CardTitle>
        <CardDescription className="mb-6 text-xs leading-relaxed">
          We&apos;ve sent an activation link to <strong className="text-foreground">{email}</strong>. 
          Please click the verification link in your email to activate your Saucer account and access your dashboard.
        </CardDescription>
        <div className="space-y-3">
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            <Link href="/login">Proceed to Sign In</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or return to{" "}
            <button 
              onClick={() => setEmailVerificationSent(false)} 
              className="text-primary underline font-medium hover:text-primary/80"
            >
              try another email
            </button>.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-xl backdrop-blur-sm bg-card/90">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Create your Saucer account</CardTitle>
        <CardDescription>
          Get started with your multi-channel social management suite
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSignup}>
        <CardContent className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Sarah Connor"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground" htmlFor="org">
              Organization or Brand Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="org"
                placeholder="Acme Media Co."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground" htmlFor="email">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="sarah@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground" htmlFor="password">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
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
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-violet-500 hover:text-violet-400">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

