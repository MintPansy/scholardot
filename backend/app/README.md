# Backend App Workspace

`backend/app/`은 백엔드 애플리케이션 소스 루트입니다.

실제 Spring Boot 프로젝트는 `backend/app/paperdot`에 있습니다.

## 실행

```bash
cd backend/app/paperdot
./gradlew bootRun --args='--spring.profiles.active=local'
```

로컬 DB 컨테이너가 필요하면 저장소 루트에서 아래를 먼저 실행하세요.

```bash
cd backend
docker compose -f compose/docker-compose.local.yml up -d
```

상세 설정과 환경 변수는 `backend/README.md`를 참고하세요.