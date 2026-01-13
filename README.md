# KKOOKK (꾸욱) - Digital Stamp Service

종이 한 장에 갇혀있던 스탬프를 디지털로 해방시켜, 사장님의 운영은 가볍게 고객의 혜택은 선명하게 만든다.

## 프로젝트 구조

모노레포 구조로 구성되어 있습니다:

- `/server` - Spring Boot 백엔드 (Java 17+)
- `/client` - React 프론트엔드 (TypeScript + Vite)

## 실행 방법

### 개발 환경 (Development)

서버와 클라이언트를 별도로 실행합니다.

**서버 (Backend)**
```bash
cd server
./gradlew bootRun
```
서버는 `http://localhost:8080`에서 실행됩니다.

**클라이언트 (Frontend)**
```bash
cd client
npm install
npm run dev
```
클라이언트는 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 배포 (Production)

단일 JAR 파일로 빌드하여 실행합니다. 프론트엔드 빌드 산출물이 서버 JAR에 포함됩니다.

**빌드**

Windows:
```bash
build.bat
```

Linux/Mac:
```bash
chmod +x build.sh
./build.sh
```

**실행**

Windows:
```bash
run.bat
```

Linux/Mac:
```bash
chmod +x run.sh
./run.sh
```

또는 직접 실행:
```bash
java -jar server/build/libs/kkookk-server-0.0.1-SNAPSHOT.jar
```

애플리케이션은 `http://localhost:8080`에서 실행됩니다.

### 빌드 산출물

- JAR 파일: `server/build/libs/kkookk-server-0.0.1-SNAPSHOT.jar`
- 클라이언트 정적 파일: `server/src/main/resources/static/` (JAR에 포함됨)

## 기술 스택

### Backend
- Java 17+
- Spring Boot 3.x
- Spring Data JPA (Hibernate)
- Spring Security + JWT
- H2 Database (개발) / MySQL (운영)
- Gradle

### Frontend
- React 18 + TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- MUI (Material-UI)
- React Hook Form + Zod

## MVP 특징

- **모바일 반응형 웹** (PWA 미지원)
- **폴링 기반** 실시간 통신 (WebSocket/SSE 미사용)
- **JWT 기반** 인증 (Refresh Token 미사용)

자세한 내용은 [PRD 문서](./prd.md)와 [작업 목록](./task-list.md)을 참고하세요.
