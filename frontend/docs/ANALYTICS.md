# 로그/통계 수집 구조 (초안)

## 목적
- 사용자 행동 이해, UX 개선, 에러/성능 모니터링을 위한 이벤트 수집 설계
- **운영 환경**: Google Analytics 4 (`G-6H3WMQ41XP`, `app/components/analytics/GoogleAnalytics.tsx`)
- **로컬 개발**: GA 스크립트 미로드, `track()`은 `console.debug`만 출력

## 수집 예정 이벤트

| 이벤트명 | 설명 | payload 예시 |
|----------|------|----------------|
| `read_filter_change` | 읽기 화면 필터 변경 (전체/한글/영어) | `filterMode` |
| `read_page_change` | 읽기 화면 페이지 이동 | `page`, `totalPages` |
| `read_search` | 번역문 검색 사용 | `queryLength` |
| `read_highlight_save` | 하이라이트 저장 | `docUnitId` |
| `read_memo_save` | 메모 저장 | `docUnitId` |
| `document_upload` | PDF 업로드 시도/완료 | `fileName`, `fileSizeBytes` |
| `document_translate_request` | 번역 파이프라인 요청 | `documentId` |
| `page_view` | 페이지 뷰 (선택) | `path`, `referrer` |
| `login` / `logout` | 로그인/로그아웃 | `provider` 등 |

## 사용 방법
- `lib/analytics.ts`의 `track(event)` 호출 → 운영에서 GA4 이벤트로 전송
- 페이지뷰는 `GoogleAnalyticsPageView`가 라우트 변경마다 자동 전송
- 측정 ID 변경: Vercel `NEXT_PUBLIC_GA_MEASUREMENT_ID` 또는 `lib/gtag.ts`의 기본값

## 개인정보
- 수집 시 개인식별 정보 최소화, 서버 저장 시 보존 기간·목적 명시 권장
