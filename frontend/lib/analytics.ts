/**
 * 로그/통계용 이벤트 수집 구조
 * - 운영 환경에서는 GA4(gtag)로 전송
 * - 개발 환경에서는 console.debug만 출력
 */

import { gaEvent, isGaEnabled } from "./gtag";

export type ReadEntrySource = "newdocument" | "library" | "demo" | "session";

export type AnalyticsEvent =
  | { name: "read_filter_change"; filterMode: "all" | "korean" | "english" }
  | { name: "read_page_change"; page: number; totalPages: number }
  | { name: "read_search"; queryLength: number }
  | { name: "read_highlight_save"; docUnitId: number }
  | { name: "read_memo_save"; docUnitId: number }
  | { name: "document_upload"; fileName: string; fileSizeBytes?: number }
  | { name: "document_translate_request"; documentId: string | number }
  | { name: "document_translate_complete"; documentId: string | number; totalSentences: number }
  | { name: "read_open"; source: ReadEntrySource }
  | { name: "read_results_view"; documentId?: string | number }
  | { name: "content_summary_toggle"; open: boolean }
  | { name: "screen_view"; screen: string }
  | { name: "page_view"; path: string; referrer?: string }
  | { name: "login"; provider?: "demo" | "kakao" }
  | { name: "logout" };

function isDevelopment(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV === "development";
}

/** 이벤트를 기록한다. 운영 환경에서는 GA4로 전송한다. */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (isDevelopment()) {
    console.debug("[analytics]", event.name, event);
  }
  if (!isGaEnabled()) return;

  const { name, ...params } = event;
  gaEvent(name, params);
}
