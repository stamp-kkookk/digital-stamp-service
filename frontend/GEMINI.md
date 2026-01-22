# Gemini Frontend Development Directives: Kkookk Client

## 1. 기술 스택 및 환경

Kkookk 프론트엔드 개발 시 다음 기술 스택과 환경을 준수합니다.

*   **프레임워크**: React + TypeScript (Vite 기반)
*   **스타일링**: Tailwind CSS
*   **라우팅**: React Router
*   **서버 상태 관리**: TanStack Query
*   **HTTP 클라이언트**: Axios
*   **폼 관리 및 유효성 검사**: React Hook Form + Zod
*   **테스트**: Vitest + React Testing Library

## 2. 클라이언트 UI 모드 (컨텍스트)

클라이언트 UI는 다음 세 가지 모드를 대상으로 개발됩니다.

1.  **Customer (고객)**: 지갑 기능 → 스탬프 진행 상황 → 발급 요청 (폴링) → 보상 사용 (OTP + 확인 + TTL)
2.  **Owner Backoffice (점주 백오피스)**: 상점 관리, 스탬프 카드, 규칙, 로그, 마이그레이션 요청 관리
3.  **Store Terminal (상점 단말기)**: 발급 승인 목록 (폴링) + 보상 사용 검증 지원

## 3. 개발 원칙 및 지침

### 긍정적 지침 (Do)
*   모든 페이지에 **로딩 (Loading) / 데이터 없음 (Empty) / 에러 (Error)** 상태를 구현해야 합니다.
*   컴포넌트를 작게 유지하고, `Page` → `Container` → `Presentational` 계층으로 분리합니다.
*   접근성을 고려한 마크업을 사용합니다 (label, aria 속성, focus rings 등).
*   Tailwind CSS 유틸리티 클래스를 우선적으로 사용하고, 반복되는 패턴은 작은 컴포넌트로 추출합니다.

### 부정적 지침 (Don't)
*   새로운 라이브러리 도입 시 명확한 이유 없이 추가하지 않습니다.
*   필요성이 입증되지 않는 한 전역 상태 관리 저장소를 구축하지 않습니다.
*   요청이 없는 한 복잡한 애니메이션을 구현하지 않습니다.

## 4. 권장 폴더 구조

`frontend/src/` 디렉토리 내에서 다음 구조를 따릅니다.

*   `app/`: 애플리케이션 진입점 및 라우터 설정
*   `pages/`: 라우트와 연결되는 페이지 컴포넌트
*   `features/`: 특정 기능 단위 모듈 (예: wallet, issuance, redeem 등)
*   `components/`: 재사용 가능한 UI 컴포넌트
*   `lib/`: API 클라이언트, 유틸리티 함수 등
*   `hooks/`: 커스텀 React Hooks
*   `types/`: TypeScript 타입 정의

## 5. API 연동 규칙

*   모든 API 호출은 `src/lib/api/*` 경로를 통해 이루어져야 합니다.
*   서버 데이터 관리는 TanStack Query를 사용합니다.
*   `src/types/*`에 정의된 타입화된 DTO를 우선적으로 사용합니다.

## 6. 로컬 개발 명령어

*   **의존성 설치**: `pnpm i`
*   **개발 서버 시작**: `pnpm dev`
*   **테스트 실행**: `pnpm test`
*   **린트 실행**: `pnpm lint`
```

---

