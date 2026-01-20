# Backend 온보딩 가이드

KKOOKK 백엔드 개발 환경 설정 가이드입니다.

---

## 목차

1. [필수 요구사항](#1-필수-요구사항)
2. [프로젝트 클론](#2-프로젝트-클론)
3. [개발 환경 설정](#3-개발-환경-설정)
4. [데이터베이스 설정](#4-데이터베이스-설정)
5. [애플리케이션 실행](#5-애플리케이션-실행)
6. [코드 품질 도구](#6-코드-품질-도구)
7. [프로젝트 구조](#7-프로젝트-구조)
8. [개발 워크플로우](#8-개발-워크플로우)
9. [자주 묻는 질문](#9-자주-묻는-질문)

---

## 1. 필수 요구사항

### 필수 설치

| 도구 | 버전 | 확인 명령어 |
|------|------|-------------|
| Java (JDK) | 17 이상 | `java -version` |
| Docker | 최신 | `docker --version` |
| Docker Compose | 최신 | `docker-compose --version` |
| Git | 최신 | `git --version` |


## 2. 프로젝트 클론

```bash
# 저장소 클론
git clone <repository-url>
cd digital-stamp-service/backend
```

---

## 3. 개발 환경 설정

### 환경변수 파일 생성

```bash
# 템플릿 복사
cp .env.example .env
```

`.env` 파일 내용 (필요시 수정):

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=kkookkdb
MYSQL_USER=kkookkuser
MYSQL_PASSWORD=kkookkpass
MYSQL_PORT=3306
```

### Gradle Wrapper 실행 권한 (Mac/Linux)

```bash
chmod +x ./gradlew
```

### 의존성 다운로드

```bash
./gradlew build -x test
```

---

## 4. 데이터베이스 설정

### MySQL 컨테이너 시작

```bash
# 컨테이너 시작 (백그라운드)
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인 (healthy 상태까지 대기)
docker-compose logs -f mysql
```

### 데이터베이스 정보

| 항목 | 값 |
|------|-----|
| Host | `localhost` |
| Port | `3306` |
| Database | `kkookkdb` |
| Username | `kkookkuser` |
| Password | `kkookkpass` |

### MySQL 직접 접속

```bash
# Docker 컨테이너 내부 MySQL CLI
docker exec -it kkookk-mysql mysql -u kkookkuser -pkkookkpass kkookkdb

# 또는 로컬 MySQL 클라이언트 사용
mysql -h localhost -P 3306 -u kkookkuser -pkkookkpass kkookkdb
```

### 스키마 관리

스키마는 SQL 파일로 직접 관리합니다:

- **초기화 스크립트**: `docker/mysql/init/01-init.sql`
- **JPA ddl-auto**: `validate` (스키마 검증만)

```bash
# 스키마 변경 후 DB 초기화 (데이터 삭제됨!)
docker-compose down -v
docker-compose up -d
```

### 컨테이너 관리 명령어

```bash
# 시작
docker-compose up -d

# 중지
docker-compose stop

# 중지 + 컨테이너 삭제
docker-compose down

# 중지 + 컨테이너 + 볼륨(데이터) 삭제
docker-compose down -v

# 재시작
docker-compose restart
```

---

## 5. 애플리케이션 실행

### 서버 시작

```bash
./gradlew bootRun
```

### 실행 확인

```bash
# Health check (서버 시작 후)
curl http://localhost:8080/actuator/health
```

### 프로파일

| 프로파일 | 용도 | DB |
|----------|------|-----|
| `local` | 로컬 개발 (기본값) | MySQL (Docker) |
| `test` | 테스트 | H2 인메모리 |

```bash
# 특정 프로파일로 실행
./gradlew bootRun --args='--spring.profiles.active=local'
```

---

## 6. 코드 품질 도구

### 도구 구성

| 도구 | 용도 | 명령어 |
|------|------|--------|
| **Spotless** | 코드 포맷팅 | `./gradlew spotlessApply` |
| **Checkstyle** | 코드 스타일 검사 | `./gradlew checkstyleMain` |
| **Jacoco** | 테스트 커버리지 | `./gradlew jacocoTestReport` |

### 자주 사용하는 명령어

```bash
# 코드 포맷팅 (자동 수정)
./gradlew spotlessApply

# 포맷 검사만 (수정 안함)
./gradlew spotlessCheck

# Checkstyle 검사
./gradlew checkstyleMain checkstyleTest

# 테스트 실행
./gradlew test

# 테스트 + 커버리지 리포트
./gradlew test jacocoTestReport

# 전체 검사 (CI와 동일)
./gradlew check

# 빌드 (테스트 포함)
./gradlew build

# 빌드 (테스트 제외)
./gradlew build -x test

# 캐시 정리 후 빌드
./gradlew clean build
```

### 리포트 위치

| 리포트 | 경로 |
|--------|------|
| 테스트 결과 | `build/reports/tests/test/index.html` |
| 커버리지 | `build/reports/jacoco/test/html/index.html` |
| Checkstyle | `build/reports/checkstyle/main.html` |

### 코드 스타일 규칙 요약

- **들여쓰기**: 4 spaces (탭 금지)
- **줄 길이**: 최대 120자
- **중괄호**: 항상 사용 (한 줄 if도)
- **import**: 와일드카드(`*`) 금지
- **네이밍**: camelCase (변수/메서드), PascalCase (클래스)

---

## 7. 프로젝트 구조

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/project/kkookk/
│   │   │   ├── KkookkApplication.java    # 메인 클래스
│   │   │   ├── global/                   # 전역 설정
│   │   │   │   ├── config/               # 설정 클래스
│   │   │   │   ├── exception/            # 예외 처리
│   │   │   │   └── response/             # 공통 응답 포맷
│   │   │   ├── controller/               # API 컨트롤러
│   │   │   ├── service/                  # 비즈니스 로직
│   │   │   ├── repository/               # 데이터 접근
│   │   │   └── domain/                   # 엔티티
│   │   └── resources/
│   │       ├── application.yaml          # 공통 설정
│   │       └── application-local.yaml    # 로컬 설정
│   └── test/
│       ├── java/                         # 테스트 코드
│       └── resources/
│           ├── application.yaml          # 테스트 프로파일 활성화
│           └── application-test.yaml     # 테스트 설정 (H2)
├── docker/
│   └── mysql/
│       ├── init/01-init.sql              # DB 초기화 스크립트
│       └── conf/my.cnf                   # MySQL 설정
├── config/
│   └── checkstyle/checkstyle.xml         # Checkstyle 설정
├── build.gradle                          # Gradle 빌드 설정
├── docker-compose.yaml                   # Docker 설정
├── .env.example                          # 환경변수 템플릿
└── .gitignore
```

### 레이어 책임

| 레이어 | 책임 |
|--------|------|
| **Controller** | HTTP 요청/응답, DTO 변환, 유효성 검사 |
| **Service** | 비즈니스 로직, 트랜잭션 관리 |
| **Repository** | 데이터 접근, JPA 쿼리 |
| **Domain** | 엔티티, 도메인 로직 |

---

## 8. 개발 워크플로우

### 일반적인 개발 흐름

```bash
# 1. 최신 코드 받기
git pull origin main

# 2. 기능 브랜치 생성
git checkout -b feature/기능명

# 3. Docker DB 시작
docker-compose up -d

# 4. 개발...

# 5. 코드 포맷팅
./gradlew spotlessApply

# 6. 전체 검사
./gradlew check

# 7. 커밋
git add .
git commit -m "feat: 기능 설명"

# 8. 푸시 및 PR 생성
git push origin feature/기능명
```

### 커밋 전 체크리스트

- [ ] `./gradlew spotlessApply` 실행
- [ ] `./gradlew check` 통과
- [ ] 테스트 코드 작성 (success + failure case)
- [ ] TODO 주석 없음

### Git 브랜치 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | 프로덕션 배포 브랜치 |
| `develop` | 개발 통합 브랜치 (optional) |
| `feature/*` | 기능 개발 |
| `fix/*` | 버그 수정 |
| `hotfix/*` | 긴급 수정 |

---

## 9. 자주 묻는 질문

### Q: Docker 컨테이너가 시작되지 않아요

```bash
# 로그 확인
docker-compose logs mysql

# 포트 충돌 확인
lsof -i :3306  # Mac/Linux
netstat -ano | findstr :3306  # Windows

# 다른 포트 사용 (.env 수정)
MYSQL_PORT=3307
```

### Q: `./gradlew` 실행 시 permission denied

```bash
chmod +x ./gradlew
```

### Q: 테스트에서 DB 연결 오류

테스트는 H2 인메모리 DB를 사용합니다. MySQL이 필요하지 않습니다.

```bash
# 테스트 실행
./gradlew test
```

### Q: Checkstyle 오류가 너무 많아요

```bash
# 먼저 Spotless로 자동 포맷팅
./gradlew spotlessApply

# 그 후 Checkstyle 확인
./gradlew checkstyleMain
```

### Q: 기존 DB 데이터를 초기화하고 싶어요

```bash
# 볼륨 포함 삭제 후 재시작
docker-compose down -v
docker-compose up -d
```

### Q: IntelliJ에서 Lombok이 작동하지 않아요

1. Lombok 플러그인 설치 확인
2. `Settings` → `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
3. ✅ `Enable annotation processing` 체크
4. IntelliJ 재시작

### Q: 스키마를 변경하고 싶어요

1. `docker/mysql/init/01-init.sql` 수정
2. DB 재초기화:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

또는 직접 SQL 실행:
```bash
docker exec -it kkookk-mysql mysql -u kkookkuser -pkkookkpass kkookkdb < your_script.sql
```

---

## 도움이 필요하면

- 프로젝트 규칙: `.claude/rules/backend/` 폴더 참고
- Claude 명령어: `.claude/commands/` 폴더 참고
- 이슈 등록: GitHub Issues

---

*마지막 업데이트: 2026-01-19*
