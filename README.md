# ScholarDot

**영어 학술 논문 PDF를 업로드하면 문장 단위로 자동 번역하고, 원문과 번역문을 나란히 읽을 수 있는 풀스택 웹 서비스입니다.**

연구자·학생이 영어 논문을 더 빠르고 깊이 이해할 수 있도록 설계된 1인 개발 졸업 프로젝트입니다.

- **프론트엔드**: [https://scholardot.vercel.app](https://scholardot.vercel.app)
- **백엔드 API**: [https://scholardot-production.up.railway.app](https://scholardot-production.up.railway.app)
- **Swagger**: `https://scholardot-production.up.railway.app/swagger-ui/index.html`

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [실행 방법](#실행-방법)
- [배포 환경](#배포-환경)
- [참고 문서](#참고-문서)

---

## 주요 기능

| 구분 | 기능 |
|------|------|
| **문서** | PDF 업로드(드래그 앤 드롭), 문서 목록 조회, 문서 삭제 |
| **번역** | 비동기 번역 파이프라인(PDF 파싱 → OpenAI 번역 → DB 저장), 진행률 폴링 |
| **읽기** | 문장 단위 한·영 병렬 보기, PDF 페이지 썸네일 사이드바, 페이지별 첫 문장 이동 |
| **형광펜·메모** | 3색 하이라이트(파랑/초록/분홍) 토글, 문장별 메모, 복습 큐, 검색 이동 |
| **이어 읽기** | 마지막 읽기 위치(페이지·스크롤) 자동저장 및 복원 |
| **문서함** | 좌측 문서 목록 클릭 시 우측 PDF 즉시 표시(blob URL 인증 방식) |
| **인증** | Kakao OAuth 2.0, JWT(액세스·리프레시), 쿠키 기반 세션 |
| **마이페이지** | 내 문서함, 계정 관리, 회원 탈퇴 |

---

## 기술 스택

### Frontend (`frontend`)

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 상태 관리 | Zustand |
| 스타일 | CSS Modules |
| PDF 렌더링 | pdfjs-dist 4.10.38 |
| 배포 | Vercel |

### Backend (`backend`)

| 분류 | 기술 |
|------|------|
| 프레임워크 | Spring Boot 4, Java 21 |
| DB·ORM | PostgreSQL, Spring Data JPA, Hibernate |
| 인증 | Spring Security, OAuth2 Client, JWT (jjwt) |
| 번역·파싱 | OpenAI API, Apache PDFBox |
| 스토리지 | 로컬 파일 스토리지 (`UPLOAD_DIR`) |
| 인프라 | Docker, Docker Compose, Railway (Dockerfile 배포) |
| 문서 | SpringDoc OpenAPI (Swagger) |

---

## 프로젝트 구조

```text
paperdot2/
├── frontend/                           # Next.js 프론트엔드 (Vercel)
│   ├── app/
│   │   ├── api/                        # OAuth 콜백 라우트
│   │   ├── components/                 # UI 컴포넌트(auth, read, header, legal...)
│   │   ├── login/ mypage/ newdocument/ read/
│   │   ├── privacy/ terms/ content/    # 정책/콘텐츠 페이지
│   │   ├── services/                   # 백엔드 API 호출 로직
│   │   ├── store/                      # Zustand 스토어
│   │   ├── config/                     # 환경 변수 유틸
│   │   └── page.tsx                    # 랜딩 페이지
│   ├── lib/                            # 공통 유틸
│   ├── public/                         # 정적 파일
│   └── package.json
│
├── backend/                            # Spring Boot 백엔드 (Railway)
│   ├── app/paperdot/                   # Gradle 프로젝트 루트
│   │   └── src/main/java/swyp/paperdot/
│   │       ├── api/ common/ state/
│   │       ├── document/ translator/   # PDF 처리 + OpenAI 번역
│   │       ├── doc_units/              # 문장/번역 데이터
│   │       └── domain/user/            # 사용자, OAuth, JWT
│   ├── compose/                        # 로컬/운영 docker-compose 파일
│   ├── docker/                         # Railway 빌드용 Dockerfile
│   └── railway.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FE_ONLY_IMPROVEMENTS.md
│   ├── HOME_SECTIONS_STRUCTURE.md
│   ├── THESIS_DEV.md
│   └── THESIS_LIMITATIONS.md
│
├── DEPLOY.md                           # Vercel 신규 배포 참고
└── README.md
```

---

## 실행 방법

### Backend

```bash
cd backend
cp .env.example .env
# .env에 DB, OpenAI API 키, OAuth, JWT 시크릿 등 설정

# (선택) 로컬 PostgreSQL 컨테이너 실행
docker compose -f compose/docker-compose.local.yml up -d

# 애플리케이션 실행
cd app/paperdot
./gradlew bootRun --args='--spring.profiles.active=local'
# 백엔드: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui/index.html
```

> Docker 없이 직접 실행하려면 JDK 21이 필요합니다.

### Frontend

```bash
cd frontend
# .env.local 파일 생성
# NEXT_PUBLIC_API_URL=http://localhost:8080

npm install
npm run dev
# http://localhost:3000
```

> `pnpm install && pnpm dev`로도 실행 가능합니다.

---

## 배포 환경

| 구분 | 플랫폼 | URL |
|------|--------|-----|
| 프론트엔드 | Vercel (`frontend` 루트로 배포) | https://scholardot.vercel.app |
| 백엔드 API | Railway (`backend` + `docker/Dockerfile`) | https://scholardot-production.up.railway.app |
| DB | Railway PostgreSQL | Railway 내부 연결 |

### Vercel (Frontend) 설정

- Root Directory: `frontend`
- 필수 환경 변수: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BASE_URL`
- OAuth 연동 변수: `NEXT_PUBLIC_KAKAO_REDIRECT_URI`

### Railway (Backend) 설정

- 빌드 설정: `backend/railway.json` 기준 (`docker/Dockerfile`)
- 필수 환경 변수: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, `OPENAI_API_KEY`
- OAuth/CORS 관련: `KAKAO_*`, `FRONTEND_BASE_URL`
- 파일 스토리지: `UPLOAD_DIR`

> 새 Vercel 도메인으로 재배포할 때는 Kakao 콘솔 redirect URI와 Railway의 `FRONTEND_BASE_URL`을 반드시 같은 도메인으로 맞춰야 로그인과 CORS가 정상 동작합니다.

---

## 참고 문서

- [frontend/README.md](frontend/README.md) — 프론트엔드 상세 구조 및 구현 설명
- [backend/README.md](backend/README.md) — 백엔드 실행 방법 및 API 구조
- [DEPLOY.md](DEPLOY.md) — Vercel 배포 체크리스트
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 시스템 아키텍처, API 목록, DB 스키마
- [docs/THESIS_DEV.md](docs/THESIS_DEV.md) — 개발 일지 (졸업 논문 재료)

---

## 라이선스

MIT
