# KKOOKK Client

KKOOKK 디지털 스탬프 서비스의 프론트엔드 애플리케이션입니다.

## 기술 스택

- React 18 + TypeScript
- Vite (빌드 도구)
- React Router (라우팅)
- TanStack Query (데이터 페칭)
- Axios (HTTP 클라이언트)
- MUI (Material-UI) (UI 컴포넌트)
- React Hook Form + Zod (폼 관리 및 검증)

## 개발 환경 설정

### 의존성 설치

```bash
npm install
```

### 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정하세요:

```bash
cp .env.example .env
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 테스트

```bash
npm run test
```

## 중요 사항

### PWA 미지원

**이 프로젝트는 MVP 단계에서 PWA를 지원하지 않습니다.**

- Service Worker 없음
- manifest.json 없음
- 오프라인 캐싱 없음
- 앱 설치 기능 없음

모바일 반응형 웹으로만 제공됩니다.

### 실시간 통신

WebSocket이나 SSE 대신 **폴링(Polling)** 방식을 사용합니다.

## 프로젝트 구조

```
src/
├── api/          # API 클라이언트 및 엔드포인트
├── components/   # 재사용 가능한 컴포넌트
├── layouts/      # 레이아웃 컴포넌트
├── pages/        # 페이지 컴포넌트
├── theme/        # MUI 테마 설정
└── types/        # TypeScript 타입 정의
```
