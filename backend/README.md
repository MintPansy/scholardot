# ScholarDot — Backend

**Spring Boot 기반 영어 논문 번역·읽기 서비스 백엔드입니다.**

- **배포**: [https://scholardot-production.up.railway.app](https://scholardot-production.up.railway.app)
- **Swagger**: `https://scholardot-production.up.railway.app/swagger-ui/index.html`
- **프론트엔드 저장소**: [frontend](../frontend/README.md)

---

## 목차

- [기술 스택](#기술-스택)
- [디렉토리 구조](#디렉토리-구조)
- [API 엔드포인트 요약](#api-엔드포인트-요약)
- [실행 방법](#실행-방법)
- [환경 변수](#환경-변수)
- [배포](#배포)
- [커밋·브랜치 컨벤션](#커밋브랜치-컨벤션)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Spring Boot 4, Java 21 |
| DB·ORM | PostgreSQL, Spring Data JPA, Hibernate |
| 인증 | Spring Security, Kakao OAuth2 Client, JWT (jjwt) |
| 번역·파싱 | OpenAI API, Apache PDFBox |
| 스토리지 | 로컬 파일 스토리지 (`UPLOAD_DIR`) |
| 인프라 | Docker, Docker Compose, Railway |
| API 문서 | SpringDoc OpenAPI (Swagger UI) |

---

## 디렉토리 구조

```text
backend/
├── app/paperdot/
│   └── src/main/java/swyp/paperdot/
│       ├── common/                       # Security, JWT, CORS
│       ├── document/
│       │   ├── controller/               # 문서 업로드/다운로드, 번역 파이프라인
│       │   ├── note/                     # 하이라이트·메모 CRUD
│       │   ├── service/                  # 파일/번역/히스토리 서비스
│       │   └── storage/                  # S3/로컬 스토리지 구현
│       ├── doc_units/                    # 문장/번역 엔티티
│       ├── domain/user/                  # 사용자, Kakao OAuth, JWT
│       ├── state/                        # 문서 상태 관리
│       ├── translator/                   # OpenAI 번역 연동
│       └── api/callLLM/                  # LLM 보조 API
├── compose/
│   ├── docker-compose.local.yml          # 로컬 PostgreSQL
│   └── docker-compose.yml                # 운영용 compose
├── docker/
│   └── Dockerfile
└── railway.json
```

---

## API 엔드포인트 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/documents` | PDF 업로드 (JWT 인증, ownerId 서버 추출) |
| `GET` | `/documents/{id}/file` | PDF 파일 스트리밍 (`?inline=true/false`) |
| `POST` | `/api/v1/documents/{id}/process` | 번역 파이프라인 시작 |
| `GET` | `/api/v1/documents/{id}/translation-progress` | 번역 진행 상태 조회 |
| `GET` | `/api/v1/documents/{id}/translation-pairs` | 번역 쌍(원문+번역) 목록 조회 |
| `GET` | `/api/v1/documents/{id}/structure-analysis` | 문서 구조 분석 결과 조회 |
| `GET` | `/api/v1/documents/translation-histories` | 내 문서 목록 (`?ownerId=`) |
| `DELETE` | `/api/v1/documents/{id}` | 문서 삭제 |
| `GET` | `/api/v1/documents/{id}/notes` | 하이라이트·메모 목록 조회 |
| `POST` | `/api/v1/documents/{id}/notes` | 하이라이트·메모 생성 |
| `PUT` | `/api/v1/documents/{id}/notes/{noteId}` | 메모 수정 |
| `DELETE` | `/api/v1/documents/{id}/notes/{noteId}` | 하이라이트·메모 삭제 |
| `POST` | `/auth/token` | JWT 액세스 토큰 발급 |
| `POST` | `/auth/logout` | 로그아웃 |
| `DELETE` | `/auth/withdraw/kakao` | 카카오 계정 회원 탈퇴 |
| `GET` | `/users/me` | 현재 사용자 정보 조회 |

> 전체 스펙은 Swagger UI에서 확인하세요.

---

## 실행 방법

### Docker (권장)

```bash
cd backend

# 환경 변수 파일 준비
cp .env.example .env
# .env 파일에 아래 환경 변수 입력

# 컨테이너 실행
docker compose -f compose/docker-compose.local.yml up -d

# 백엔드: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui/index.html

# 종료
docker compose -f compose/docker-compose.local.yml down
```

### 직접 실행 (JDK 21 필요)

```bash
cd backend/app/paperdot
./gradlew bootRun --args='--spring.profiles.active=local'
```

---

## 환경 변수

`.env` 파일에 아래 변수를 설정합니다.

```env
# 서버/DB (compose 기준)
BACKEND_PORT=8080
POSTGRES_PORT=5434
POSTGRES_USER=paper
POSTGRES_PASSWORD=paper1234
POSTGRES_DB=paper_local

# JWT
JWT_SECRET=<32바이트 이상 랜덤 hex 문자열>

# OAuth — Kakao
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_ADMIN_KEY=

# 프론트엔드 도메인 (CORS, OAuth 리다이렉트 기준)
FRONTEND_BASE_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=

# 파일 업로드 경로 (로컬 fallback)
UPLOAD_DIR=./uploads

```

> PowerShell에서 JWT_SECRET 생성:
> ```powershell
> -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
> ```

---

## 배포

Railway를 사용하며, `main` 브랜치 머지 시 자동 배포됩니다.

**Railway 환경 변수 예시** (PostgreSQL 서비스명: `Postgres`)

```
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
FRONTEND_BASE_URL=https://scholardot.vercel.app
UPLOAD_DIR=/app/uploads
```

**Kakao OAuth 설정 주의사항**
- Redirect URI는 **프론트가 아닌 백엔드** 도메인 기준으로 등록해야 합니다.
- 예: `https://scholardot-production.up.railway.app/login/oauth2/code/kakao`

---

## 커밋·브랜치 컨벤션

### 브랜치

| 브랜치 | 용도 |
|--------|------|
| `main` | 배포 브랜치 |
| `feature/*` | 기능 개발 |
| `fix/*` | 버그 수정 |
| `chore/*` | 설정, 문서, 인프라 |

### 커밋 메시지

```
<type>: <summary>
```

| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 (기능 변화 없음) |
| `chore` | 설정, 빌드, 인프라, 패키지 |
| `docs` | 문서 추가·수정 |
| `test` | 테스트 코드 |

**예시**
```
feat: add PDF inline download endpoint
fix: resolve Spring Security form login redirect loop
chore: update Railway environment variable docs
```

> `main` 브랜치에 직접 push하지 않습니다. 모든 변경은 PR을 통해 병합합니다.
