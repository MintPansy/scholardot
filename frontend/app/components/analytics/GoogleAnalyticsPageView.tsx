"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { pageview } from "@/lib/gtag";

type Props = {
  measurementId: string;
};

export default function GoogleAnalyticsPageView({ measurementId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    pageview(pathname + (query ? `?${query}` : ""), measurementId);
  }, [pathname, searchParams, measurementId]);

  return null;
}
