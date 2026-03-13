# 📄 Paper Dot

논문을 쉽고 빠르게 탐색하고 저장할 수 있는 웹 서비스

**배포 링크**: [https://fe-paper-dot.vercel.app/](https://fe-paper-dot.vercel.app/)  
**GitHub**: [https://github.com/swyppaperreader/FE-Paper-Dot](https://github.com/swyppaperreader/FE-Paper-Dot)

---

## 📌 최근 변경 사항

아래는 현재 작업 트리 기준으로 이전 커밋 대비 달라진 부분입니다.

| 구분 | 변경 내용 |
|------|-----------|
| **app/layout.tsx** | **파비콘 설정 개선** — `metadata.icons`를 단일 SVG에서 확장하여, SVG(`/favicon.svg`)와 ICO(`/favicon.ico`)를 함께 지원하고, `shortcut`·`apple` 아이콘을 추가했습니다. 브라우저·기기별 파비콘 표시와 SEO/브랜딩을 고려한 설정입니다. |
| **README.md** | 프로젝트명을 Paper Reader에서 **Paper Dot**으로 정리하고, 프로젝트 소개·기술 스택·기여 내용·트러블슈팅·실행 방법·환경 변수 등을 현재 구조에 맞게 전면 정리했습니다. |

> `.claude/settings.local.json`은 Claude/에디터용 로컬 설정 파일(권한 등)이며, 프로젝트 동작에는 영향을 주지 않습니다.

---

## 📋 프로젝트 소개

Paper Dot은 영어 논문 PDF를 업로드하면 자동으로 한글로 번역하고, 원문과 번역문을 함께 읽을 수 있도록 도와주는 웹 서비스입니다. 연구자와 학생들이 논문을 더 쉽게 이해하고 학습할 수 있도록 설계되었습니다.

---

## ✨ 주요 기능

- **📤 PDF 업로드**: 드래그 앤 드롭 또는 파일 선택으로 PDF 업로드
- **🔄 자동 번역**: 백엔드 API를 통한 비동기 번역 처리 및 폴링을 통한 실시간 상태 확인
- **📖 번역 결과 조회**: 원문과 번역문을 함께 보거나 각각 따로 볼 수 있는 필터링 기능
- **📄 PDF 뷰어**: PDF.js를 활용한 PDF 페이지별 썸네일 및 동기화된 스크롤
- **🔐 소셜 로그인**: Google, Kakao OAuth를 통한 간편 로그인
- **💾 문서 관리**: 업로드한 문서 목록 조회 및 관리

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** (App Router)
  - 서버 컴포넌트와 클라이언트 컴포넌트 분리로 성능 최적화
  - API Routes를 활용한 OAuth 인증 처리
- **React 19**
  - 최신 React 기능 활용
- **TypeScript**
  - 타입 안정성 확보 및 개발 생산성 향상
- **Zustand**
  - Redux 대비 간결한 API로 빠른 상태 관리 구현
  - 전역 상태(로그인 정보, 문서 ID) 관리에 최적화
- **Tailwind CSS**
  - 유틸리티 기반 스타일링으로 빠른 UI 개발
  - 반응형 디자인 구현 용이

### 기타
- **PDF.js**: PDF 렌더링 및 텍스트 추출
- **Vercel**: 배포 및 호스팅

---

## 💡 내가 기여한 부분

### 1. 상태 관리 구조 설계 및 구현

**문제**:  
- 로그인 상태, 사용자 정보, 문서 ID 등 전역 상태 관리 필요
- Redux는 보일러플레이트 코드가 많아 프로젝트 규모에 비해 과함
- Context API는 불필요한 리렌더링 발생 가능

**해결**:  
- Zustand를 선택하여 간결하고 효율적인 상태 관리 구조 설계
- 로그인 상태(`useLoginStore`), 문서 상태(`useDocumentStore`), 토큰 관리(`useAccessTokenStore`)로 분리
- 타입 안정성을 위한 TypeScript 인터페이스 정의

**결과**:  
- 약 40줄의 코드로 전역 상태 관리 완성
- 불필요한 리렌더링 없이 필요한 컴포넌트만 업데이트
- 코드 가독성 및 유지보수성 향상

```typescript
// app/store/useLogin.ts
export const useLoginStore = create<LoginState>((set) => ({
  login: false,
  userInfo: null,
  setUserInfo: (userInfo) => set({ userInfo }),
  setLogin: (login) => set({ login }),
}));
```

---

### 2. 비동기 번역 처리 및 폴링 로직 구현

**문제**:  
- PDF 업로드 후 번역 처리가 비동기로 진행되어 완료 시점을 알 수 없음
- 사용자에게 진행 상태를 명확히 전달해야 함
- 번역 완료 전 조회 시 404 에러 발생

**해결**:  
- `postTranslation`으로 번역 요청 후 `getTranslation`을 주기적으로 호출하는 폴링 로직 구현
- 최대 20회 시도, 3초 간격으로 조회
- 404 에러는 "처리 중" 상태로 간주하여 무시하고 계속 시도
- 진행 상태를 UI에 반영 (로딩 스피너, 진행률 표시)

**결과**:  
- 사용자가 번역 완료를 기다리지 않고 다른 작업 가능
- 실시간으로 번역 상태 확인 가능
- 네트워크 오류나 일시적 서버 오류에도 안정적으로 처리

```typescript
// app/components/document/ui/NewDocument.tsx
const maxAttempts = 20;
const intervalMs = 3000;

for (let attempt = 0; attempt < maxAttempts; attempt++) {
  await new Promise((r) => setTimeout(r, intervalMs));
  const raw = await getTranslation(document.documentId);
  // 404는 처리 중 상태로 간주
  if (list.length > 0) {
    setTranslatedText(pairs);
    return; // 성공 시 종료
  }
}
```

---

### 3. API 연동 및 에러 처리

**문제**:  
- 다양한 HTTP 상태 코드에 대한 일관된 에러 처리 필요
- 인증 실패 시 HTML 응답 반환으로 JSON 파싱 오류 발생
- 네트워크 오류와 서버 오류 구분 필요

**해결**:  
- `Content-Type` 헤더를 확인하여 HTML 응답 감지
- 상태 코드별 명확한 에러 메시지 제공 (401/403: 인증 필요, 404: 처리 중, 기타: 서버 오류)
- try-catch로 네트워크 오류와 서버 오류 구분
- 사용자 친화적인 에러 메시지 표시

**결과**:  
- 모든 API 호출에서 일관된 에러 처리
- 사용자에게 명확한 피드백 제공
- 디버깅 용이성 향상

```typescript
// app/services/document.ts
const contentType = response.headers.get("content-type") || "";
if (contentType.includes("text/html")) {
  throw new Error("인증이 필요합니다. 로그인해주세요.");
}

if (!response.ok) {
  if (response.status === 401 || response.status === 403) {
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }
  if (response.status === 404) {
    return []; // 빈 배열 반환 (폴링 로직에서 계속 시도)
  }
  throw new Error("번역된 문서를 가져오는데 실패했습니다!");
}
```

---

### 4. PDF 텍스트 추출 및 번역 항목 매핑

**문제**:  
- 번역된 텍스트 항목을 PDF 페이지와 매칭해야 함
- PDF에서 추출한 텍스트와 번역 항목의 정확한 매칭 필요
- 페이지별로 번역 항목 그룹화 필요

**해결**:  
- PDF.js를 사용하여 각 페이지의 텍스트 추출
- 텍스트 정규화(소문자 변환, 특수문자 제거) 후 문자열 매칭
- 연속 단어 3~5개로 우선 검색, 실패 시 1~2개 단어로 폴백
- 매칭 실패 시 이전 항목과 같은 페이지로 보정

**결과**:  
- 번역 항목이 정확한 PDF 페이지와 매칭됨
- 페이지별 구분선 표시로 사용자 경험 향상
- 스크롤 시 현재 페이지 자동 감지 및 사이드바 동기화

```typescript
// app/components/read/readList/ReadList.tsx
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// 연속 단어로 검색
for (let wLen = Math.min(5, words.length); wLen >= 3 && !found; wLen--) {
  const phrase = words.slice(0, wLen).join(" ");
  for (let p = 0; p < pageTexts.length; p++) {
    if (pageTexts[p].includes(phrase)) {
      assigned[i] = p + 1;
      found = true;
      break;
    }
  }
}
```

---

### 5. OAuth 인증 플로우 구현

**문제**:  
- Google, Kakao OAuth 리다이렉트 후 인증 코드 추출 필요
- 서버 컴포넌트와 클라이언트 컴포넌트 간 인증 상태 동기화
- 쿠키와 세션 스토리지를 활용한 토큰 관리

**해결**:  
- Next.js API Routes에서 OAuth 콜백 처리
- 쿠키, Referer 헤더, 요청 URL에서 인증 코드 추출하는 유틸리티 함수 구현
- 추출한 코드를 쿠키에 저장하여 후속 요청에서 활용
- 클라이언트에서 쿠키를 읽어 Zustand 스토어에 반영

**결과**:  
- 안정적인 OAuth 인증 플로우 구현
- 다양한 경로에서 인증 코드 추출 가능
- 사용자 로그인 상태 유지

---

### 6. 사용자 경험 개선 및 SEO 최적화

**문제**:  
- 메인 화면의 CTA(행동 유도) 버튼이 제대로 작동하는지 검증 필요
- 파비콘이 단일 형식만 지원하여 다양한 브라우저/기기에서 표시 문제 발생 가능
- SEO 및 브랜딩 측면에서 파비콘 최적화 필요

**해결**:  
- 메인 화면의 "지금 시작하기" 버튼이 `/newdocument` 페이지로 정상 연결되는지 검증
- Next.js Metadata API를 활용하여 SVG와 ICO 형식 모두 지원하도록 파비콘 설정 개선
- 다양한 기기(데스크탑, 모바일, Apple 기기)에 맞는 파비콘 설정 추가
- `shortcut` 및 `apple` 아이콘 설정으로 브랜드 일관성 확보

**결과**:  
- 메인 화면에서 문서 업로드 페이지로의 사용자 플로우 검증 완료
- 모든 브라우저와 기기에서 파비콘 정상 표시
- 브랜드 인지도 향상 및 SEO 개선
- 사용자 경험의 일관성 확보

```typescript
// app/layout.tsx
icons: {
  icon: [
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon.ico", sizes: "any" },
  ],
  shortcut: "/favicon.ico",
  apple: "/favicon.ico",
}
```

---

## 🐛 트러블슈팅 경험

### 1. PDF.js Worker 파일 로드 오류

**문제**:  
- CDN에서 PDF.js worker 파일을 로드할 때 `Source file not found` 에러 발생
- Vercel 배포 환경에서 worker 파일 경로 문제

**해결**:  
- `node_modules/pdfjs-dist`에서 worker 파일을 `public/` 폴더로 복사
- `GlobalWorkerOptions.workerSrc`를 로컬 파일 경로로 설정
- 빌드 시 자동 복사되도록 설정

**학습**:  
- CDN 의존성보다 로컬 파일 사용이 배포 환경에서 더 안정적
- 빌드 프로세스에 자동화 스크립트 포함의 중요성

---

### 2. 비동기 번역 처리 완료 시점 감지

**문제**:  
- 번역 요청 후 완료 시점을 알 수 없어 사용자가 대기해야 함
- 404 에러를 에러로 처리하여 번역 실패로 오인

**해결**:  
- 폴링 로직 구현으로 주기적으로 번역 결과 조회
- 404는 "처리 중" 상태로 간주하여 에러가 아닌 정상 상태로 처리
- 최대 시도 횟수와 간격을 설정하여 무한 대기 방지

**학습**:  
- 비동기 작업의 상태를 명확히 구분하는 것의 중요성
- 사용자 경험을 고려한 에러 처리 전략

---

### 3. PDF 텍스트와 번역 항목 매칭 정확도

**문제**:  
- PDF에서 추출한 텍스트와 번역 항목의 정확한 매칭이 어려움
- 특수문자, 대소문자 차이로 매칭 실패

**해결**:  
- 텍스트 정규화 함수 구현 (소문자 변환, 특수문자 제거)
- 연속 단어로 검색하여 정확도 향상
- 매칭 실패 시 이전 항목과 같은 페이지로 보정하는 폴백 로직

**학습**:  
- 데이터 매칭 시 정규화의 중요성
- 단계적 검색 전략으로 정확도와 성능 균형

---

## 🚀 실행 방법

### 환경 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_API_URL=https://be-paper-dot.store
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_KAKAO_REDIRECT_URI=your_kakao_redirect_uri
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

---

## 🔮 향후 개선 방향

- [ ] **번역 품질 향상**: 사용자 피드백을 통한 번역 품질 개선
- [ ] **오프라인 지원**: Service Worker를 활용한 오프라인 읽기 기능
- [ ] **검색 기능**: 번역된 문서 내 키워드 검색
- [ ] **하이라이트 및 메모**: 중요 문장 하이라이트 및 메모 기능
- [ ] **다국어 지원**: 영어 외 다른 언어 번역 지원
- [ ] **성능 최적화**: 대용량 PDF 처리 성능 개선
- [ ] **접근성 개선**: 스크린 리더 지원 및 키보드 네비게이션

---

## 📚 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Zustand 공식 문서](https://zustand-demo.pmnd.rs/)
- [PDF.js 공식 문서](https://mozilla.github.io/pdf.js/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)

---

## 📄 라이선스

MIT
