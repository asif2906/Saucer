import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({
  className,
  showText = true,
  size = "md",
  href,
}: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base tracking-wider",
    md: "text-lg tracking-widest",
    lg: "text-xl tracking-widest",
  };

  const content = (
    <div className={cn("flex items-center gap-2.5 font-bold select-none group", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform",
          iconSizes[size]
        )}
      >
        {/* Saucer Orbit Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6 text-white"
        >
          {/* Outer Orbital Ring */}
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="4.5"
            transform="rotate(-25 12 12)"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeDasharray="28 4"
            className="opacity-90"
          />
          {/* Inner Glowing Core */}
          <circle cx="12" cy="12" r="3.2" fill="currentColor" />
          {/* Orbiting Satellite Node */}
          <circle cx="18.5" cy="8.5" r="1.5" fill="#c4b5fd" />
        </svg>
      </div>

      {showText && (
        <span
          className={cn(
            "font-extrabold uppercase font-sans text-foreground tracking-widest flex items-center gap-1",
            textSizes[size]
          )}
        >
          <span>SAUCER</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

