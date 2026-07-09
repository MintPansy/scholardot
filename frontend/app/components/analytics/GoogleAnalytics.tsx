import Script from "next/script";
import { Suspense } from "react";
import { getGaMeasurementId, isGaEnabled } from "@/lib/gtag";
import GoogleAnalyticsPageView from "./GoogleAnalyticsPageView";
import AnalyticsScreenTracker from "./AnalyticsScreenTracker";

export default function GoogleAnalytics() {
  if (!isGaEnabled()) return null;

  const measurementId = getGaMeasurementId();

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView measurementId={measurementId} />
        <AnalyticsScreenTracker />
      </Suspense>
    </>
  );
}
