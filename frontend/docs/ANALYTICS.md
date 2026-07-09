# 로그/통계 수집 구조 (초안)

## 목적
- 사용자 행동 이해, UX 개선, 에러/성능 모니터링을 위한 이벤트 수집 설계
- **운영 환경**: Google Analytics 4 (`G-6H3WMQ41XP`, `app/components/analytics/GoogleAnalytics.tsx`)
- **로컬 개발**: GA 스크립트 미로드, `track()`은 `console.debug`만 출력

## 수집 이벤트

| 이벤트명 | 설명 | payload 예시 |
|----------|------|----------------|
| `screen_view` | 주요 화면 진입 | `screen` (`home`, `login`, `read`, …) |
| `page_view` | URL 기준 페이지뷰 (자동) | `page_path` (gtag) |
| `login` / `logout` | 로그인/로그아웃 | `provider` (`demo` \| `kakao`) |
| `document_upload` | PDF 업로드 완료 | `fileName`, `fileSizeBytes` |
| `document_translate_request` | 번역 파이프라인 요청 | `documentId` |
| `document_translate_complete` | 번역 완료 | `documentId`, `totalSentences` |
| `read_results_view` | 「번역 결과 보기」 클릭 | `documentId` |
| `read_open` | 읽기 화면 진입 | `source` (`newdocument` \| `library` \| `demo` \| `session`) |
| `read_filter_change` | 읽기 필터 변경 | `filterMode` |
| `read_page_change` | 읽기 페이지 이동 | `page`, `totalPages` |
| `read_search` | 번역문 검색 (800ms 디바운스) | `queryLength` |
| `read_highlight_save` | 하이라이트 저장 | `docUnitId` |
| `read_memo_save` | 메모 저장 | `docUnitId` |
| `content_summary_toggle` | 「이 논문 한눈에」 펼침/접기 | `open` |

## 사용 방법
- `lib/analytics.ts`의 `track(event)` 호출 → 운영에서 GA4 이벤트로 전송
- 페이지뷰: `GoogleAnalyticsPageView` (URL), `AnalyticsScreenTracker` (화면명)
- 읽기 진입 경로: `lib/analyticsSession.ts`의 `markReadEntrySource` / `consumeReadEntrySource`
- 측정 ID 변경: Vercel `NEXT_PUBLIC_GA_MEASUREMENT_ID` 또는 `lib/gtag.ts`의 기본값

## 개인정보
- 수집 시 개인식별 정보 최소화, 서버 저장 시 보존 기간·목적 명시 권장
