# KKOOKK - Digital Stamp Service

종이 한 장에 갇혀있던 스탬프를 디지털로 해방시켜, 사장님의 운영은 가볍게 고객의 혜택은 선명하게 만든다.

## Prerequisites
- Java 17+, Docker, Docker Compose
- Node.js 20+, pnpm

## Backend 실행
```bash
cd backend
cp .env.example .env                     # 환경변수 설정
docker-compose up -d                     # MySQL 8.0 (port 3306)
./gradlew bootRun                        # API 서버 (port 8080)
```

## Frontend 실행
```bash
cd frontend
pnpm install
pnpm dev                                 # 개발 서버 (port 5173, /api -> :8080 프록시)
```

## 접속 정보

| 서비스          | URL                                         |
|-----------------|---------------------------------------------|
| Backend API     | http://localhost:8080/api                    |
| Swagger UI      | http://localhost:8080/swagger-ui/index.html  |
| OpenAPI JSON    | http://localhost:8080/v3/api-docs            |
| Frontend Dev    | http://localhost:5173                        |
| MySQL           | localhost:3306                               |

## 빌드 & 검증
```bash
# Backend
./gradlew check                          # test + spotless + checkstyle + jacoco

# Frontend
pnpm build && pnpm lint
```

## 문서
- [docs/prd-v2.md](docs/prd-v2.md) - 제품 요구사항
- [docs/api-reference.md](docs/api-reference.md) - API 엔드포인트 카탈로그
- [docs/architecture.md](docs/architecture.md) - 시스템 아키텍처
- [docs/utility-registry.md](docs/utility-registry.md) - 재사용 유틸리티 목록
- [docs/feature-specs/](docs/feature-specs/) - 피처별 명세
