"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

const SCREEN_BY_PATH: Record<string, string> = {
  "/": "home",
  "/login": "login",
  "/read": "read",
  "/newdocument": "newdocument",
  "/mypage/mydocument": "mydocument",
  "/mypage/account": "account",
  "/terms": "terms",
  "/privacy": "privacy",
};

export default function AnalyticsScreenTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const screen = SCREEN_BY_PATH[pathname];
    if (!screen || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    track({ name: "screen_view", screen });
  }, [pathname]);

  return null;
}
