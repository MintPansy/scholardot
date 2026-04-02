# 실험 실행 가이드

## 사전 준비

### 1. Docker로 PostgreSQL 실행 (터미널 1)
```bash
cd backend
docker compose -f compose/docker-compose.local.yml up -d
```

### 2. OPENAI_API_KEY 설정
`backend/.env` 파일에서:
```
OPENAI_API_KEY=sk-...
```

### 3. 백엔드 실행 (터미널 2)
```bash
cd backend/app/paperdot
# Windows
set OPENAI_API_KEY=sk-...  && ./gradlew bootRun --args='--spring.profiles.active=local'

# 또는 .env를 IntelliJ Run Configuration에서 로드
```

### 4. 테스트 PDF 준비
`experiment/pdfs/` 폴더에 다양한 분량의 영어 학술 논문 PDF를 넣어주세요:
- `01page.pdf` — 1페이지짜리
- `03page.pdf` — 3페이지짜리
- `05page.pdf` — 5페이지짜리
- `10page.pdf` — 10페이지짜리

arxiv.org 에서 논문 PDF를 자유롭게 다운로드 가능합니다.

### 5. Python 의존성 설치
```bash
pip install requests
```

---

## 실험 실행 순서

### 실험 1: 번역 파이프라인 성능 측정
```bash
cd experiment
python measure_pipeline.py
```
→ `results_pipeline.csv` 생성 (페이지 수별 번역 완료 시간)

### 실험 2: API 응답 시간 측정
1. `results_pipeline.csv`에서 번역 완료된 documentId 확인
2. `measure_latency.py` 상단 `DOC_ID = None` → `DOC_ID = <확인한 ID>`로 변경
3. 실행:
```bash
python measure_latency.py
```
→ `results_latency.csv` 생성

---

## 결과 예시 (논문 표)

**표 1. 페이지 수별 번역 완료 시간**

| 페이지 수 | Trial 1 | Trial 2 | Trial 3 | 평균 |
|-----------|---------|---------|---------|------|
| 1페이지   | -       | -       | -       | -    |
| 3페이지   | -       | -       | -       | -    |
| 5페이지   | -       | -       | -       | -    |
| 10페이지  | -       | -       | -       | -    |

**표 2. 주요 API 응답 시간**

| 엔드포인트 | 평균 | 최대 | p95 |
|------------|------|------|-----|
| 번역 진행률 조회 | - | - | - |
| 번역 쌍 조회     | - | - | - |
