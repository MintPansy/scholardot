/**
 * 법률/정책 문서 본문 블록. 약관·개인정보 처리방침 등에서 공통 사용.
 */

export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type LegalRelatedLink = {
  label: string;
  href: string;
};

export type LegalDocumentMeta = {
  /** 최종 수정일 (표시용 문자열) */
  updatedAt?: string;
  /** 시행일 */
  effectiveDate?: string;
  contactEmail?: string;
  relatedLinks?: LegalRelatedLink[];
};

export type LegalSummaryItem = {
  label: string;
  value: string;
};

export type LegalDocumentConfig = {
  /** 브라우저 탭 등용 짧은 제목 */
  documentTitle: string;
  /** 페이지 상단 큰 제목 */
  pageTitle: string;
  /** 카드 상단 리드(한두 문단) */
  lead: string[];
  /** 본문 상단 메타 (수정일·문의 등) */
  meta?: LegalDocumentMeta;
  /** 개인정보처리방침 등 핵심 요약 */
  summary?: LegalSummaryItem[];
  blocks: LegalBlock[];
};
