/** GA4 측정 ID (공개 값). 환경 변수로 덮어쓸 수 있다. */
export const GA_MEASUREMENT_ID = "G-6H3WMQ41XP";

export function getGaMeasurementId(): string {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? GA_MEASUREMENT_ID;
}

/** 로컬 개발에서는 GA 전송을 끈다. */
export function isGaEnabled(): boolean {
  return process.env.NODE_ENV === "production";
}

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export function pageview(
  url: string,
  measurementId = getGaMeasurementId()
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", measurementId, { page_path: url });
}

export function gaEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}
