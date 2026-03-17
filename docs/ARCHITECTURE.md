# 시스템 설계 문서 (논문용)

**논문 제목**: 영어 학술 문서를 문장 단위로 한·영 병렬 읽기/번역할 수 있는 웹 시스템의 설계 및 구현

---

## 1. 시스템 개요

- **사용자** → 브라우저에서 웹 앱 접속
- **브라우저(Next.js)** → React로 렌더링, PDF 뷰어·번역문 표시
- **Next.js API Routes** → 인증/토큰 갱신 프록시, (선택) 번역 프록시
- **외부·백엔드**
  - **Spring Boot 백엔드(be-paper-reader)**: 문서 업로드, 텍스트 추출, 번역 파이프라인, 저장소·DB
  - **외부 LLM API**: 번역(OpenAI 등) — Next.js 경유 또는 백엔드 직접 호출
  - **스토리지**: PDF 원본 저장(NCP/S3 호환), DB(PostgreSQL)
- TODO: 위 흐름을 한 장의 구성도(Mermaid 또는 다이어그램)로 정리

---

## 2. 프론트엔드 구조

### `app/`
- **페이지**: `page.tsx`(메인), `read/`, `newdocument/`, `login/`, `mypage/*`
- **라우팅**: App Router 기준, `layout.tsx`로 공통 레이아웃
- **API Routes**: `app/api/*` — 아래 “백엔드/API 구조” 참고
- **상태·설정**: `store/`(Zustand), `config/env.ts`, `consts/`
- **서비스·유틸**: `services/`(document, userInfo, logout 등), `utils/`, `hooks/`

### `app/components/`
- **레이아웃**: `layout/Layout.tsx`, 메인 화면(First~Fifth MainScreen), `Header`, `Footer`
- **읽기**: `read/Read.tsx`, `read/readList/ReadList.tsx` — PDF·번역문 문장 단위 표시
- **문서**: `document/ui/NewDocument.tsx` — 업로드·번역 요청 UI
- **마이페이지·공통**: `mypage/ui/`, `modal/`, `button/`, `header/`(로그인 상태 등)
- TODO: 컴포넌트 트리 또는 주요 화면별 사용 컴포넌트 목록

### `lib/`
- **api.ts**: 번역·업로드·텍스트 추출 등 공통 API 클라이언트 시그니처 및 연동
- **analytics.ts**: (선택) 분석·로그 유틸
- TODO: lib와 services 역할 구분 정리(논문용 1~2문장)

---

## 3. 백엔드/API 구조

> 실제 문서·번역 파이프라인은 **Spring Boot(be-paper-reader)** 에서 담당.  
> 아래는 **Next.js API Routes(`app/api/*/route.ts`)** 역할 정리.

| 경로 | 역할 | 비고 |
|------|------|------|
| `app/api/auth/token/route.ts` | 쿠키를 백엔드로 전달, JWT(액세스·리프레시) 발급/갱신 응답을 그대로 반환 | 구현됨 |
| `app/api/translate/route.ts` | 문장 배열 수신 → OpenAI(또는 mock) 번역 → 결과 JSON 반환 | 구현됨 |
| `app/api/upload/route.ts` | PDF 업로드 요청 수신 | TODO: multipart 파싱 후 백엔드 POST /documents 또는 스토리지 연동 |
| `app/api/extract/route.ts` | documentId 수신 후 텍스트 추출 결과 반환 | TODO: 백엔드 추출 API 호출 또는 직접 추출 구현 |

- 현재 문서 업로드·목록·번역 상태 조회 등은 `services/document.ts` 등에서 **백엔드 URL 직접 호출**.
- TODO: Next.js API Routes를 전부 프록시로 통일할지, 일부만 쓸지 정책 정리.

---

## 4. 데이터 흐름

### PDF 업로드 → 텍스트 추출 → 번역 → 문장 단위 뷰어

1. **PDF 업로드**
   - 사용자가 `newdocument`에서 파일 선택/드래그 앤 드롭
   - FE → 백엔드 `POST /documents` (multipart) 또는 TODO: `app/api/upload` 경유
   - 백엔드: 오브젝트 스토리지 저장, 문서 메타·상태 DB 저장

2. **텍스트 추출**
   - 백엔드 파이프라인에서 Apache PDFBox 등으로 추출
   - TODO: 추출 결과를 문장/단위로 나누어 저장하는 형식 명시

3. **번역**
   - 백엔드: OpenAI API 호출로 문장 단위 번역, 원문·번역문 쌍 저장
   - FE: 폴링으로 번역 진행률/완료 조회 (또는 TODO: SSE 실시간 진행률)

4. **문장 단위 뷰어**
   - `read` 페이지: 문서 ID로 번역 쌍 조회
   - PDF.js로 원문 페이지 렌더링, `ReadList` 등으로 문장 단위 한·영 병기 표시
   - TODO: 스크롤 동기화·페이지–문장 매핑 알고리즘 요약(논문용)

---

## 5. 사용 기술 스택 요약

| 구분 | 기술 |
|------|------|
| **프론트엔드** | Next.js(App Router), React, TypeScript, Zustand, Tailwind CSS, CSS Modules, PDF.js |
| **FE 호스팅** | Vercel |
| **백엔드** | Spring Boot, Java 17, Spring Data JPA, Spring Security, OAuth2, JWT |
| **DB** | PostgreSQL |
| **번역** | OpenAI API (또는 호환 LLM) |
| **스토리지** | NCP/S3 호환 오브젝트 스토리지 |
| **인프라** | Docker / Docker Compose, (선택) GitHub Actions CI/CD |

- TODO: 논문 “관련 연구”용으로 기술 선정 이유 1~2문장씩 정리.
