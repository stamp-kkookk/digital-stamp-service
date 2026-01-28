# Claude Guide (Client)

## 1) Stack

- React + TypeScript (Vite)
- Tailwind CSS
- React Router
- TanStack Query (server state)
- Axios (HTTP client)
- React Hook Form + Zod (forms & validation)

> Skill files live in `.claude/skills/frontend-core/*`, `.claude/skills/frontend-testing/*`, and `.claude/skills/design-system/*`.

## 2) Product contexts (KKOOKK)

Client UI targets 3 modes:

1. **Customer**: Wallet → stamp progress → request issuance (polling) → redeem (OTP + confirm + TTL)
2. **Owner Backoffice**: manage stores, stamp cards, rules, logs, migration requests
3. Store Terminal: A dedicated web view optimized for tablet and mobile UIs, allowing owners to approve issuance requests via polling and verify redemptions in real-time.

## 3) Do / Don't

✅ Do

- **Always refer to the `frontend-core` and `design-system` skills in `.claude/skills`**
- Implement **loading / empty / error** states for every page.
- Keep components small: `Page` → `Container` → `Presentational` split.
- Use accessible markup (labels, aria attributes, focus rings).
- Prefer Tailwind utilities; extract repeated patterns into small components.

❌ Don't

- Don't introduce new libraries without explaining why.
- Don't build a global state store unless required.
- Don't do complex animation unless requested.

## 4) Folder structure

```
src/
├── app/                        # 1. 앱 전역 설정
│   ├── providers/              # TanStack Query, Auth, Theme Provider 등
│   ├── router/                 # React Router (모드별 경로 정의)
│   └── main.tsx                # Entry point
│
├── pages/                      # 2. 라우트 페이지 (Lazy Loading 권장)
│   ├── customer/               # 고객용 PWA 페이지들
│   ├── owner/                  # 사장님 백오피스 페이지들
│   └── terminal/               # 매장 단말 승인 페이지들
│
├── features/                   # 3. 도메인별 핵심 기능 모듈 ⭐
│   ├── wallet/                 # [도메인: 고객 지갑] 목록, 히스토리
│   ├── issuance/               # [도메인: 적립/QR] 적립 요청, 폴링 로직
│   ├── redemption/             # [도메인: 리워드/리딤] 사용 요청, OTP
│   ├── stamp-card/             # [도메인: 스탬프] 카드 디자인, 규칙 설정
│   ├── store-management/       # [도메인: 매장] 매장 등록, QR 생성
│   └── migration/              # [도메인: 마이그레이션] 사진 업로드, 수동 승인
│
├── components/                 # 4. 공통 UI 컴포넌트 (Design System)
│   ├── ui/                     # Button, Input, Modal, Badge (shadcn/ui)
│   ├── layout/                 # Navigation, Sidebar, Footer
│   └── shared/                 # 도메인에 묶이지 않는 범용 컴포넌트
│
├── hooks/                      # 5. 전역 공통 커스텀 훅
│   ├── useAuth.ts
│   └── useLocalStorage.ts
│
├── lib/                        # 6. 외부 라이브러리 설정 및 유틸
│   ├── api/                    # Axios 인스턴스 및 인터셉터 설정
│   ├── utils/                  # 날짜 포맷팅, Tailwind merge 등
│   └── constants/              # API 엔드포인트, TTL 시간 등 상수
│
├── types/                      # 7. 전역 타입 및 DTO
│   ├── api.d.ts                # 공통 응답 구조
│   └── domain.ts               # Wallet, StampCard, Store 등 엔티티 타입
│
└── assets/                     # 8. 정적 자원
    ├── styles/                 # Tailwind 전역 설정 (index.css)
    └── icons/                  # SVG 아이콘 등
```

> **Note**: `features/` 안에는 도메인 로직만 둡니다. 공통 컴포넌트/훅은 `src/components/`, `src/hooks/`에 위치합니다.

## 5) API integration rules

- All API calls go through `src/lib/api/*`.
- Use TanStack Query for server data.
- Prefer typed DTOs in `src/types/*`.

## 6) Local commands

```bash
pnpm i
pnpm dev
pnpm test
pnpm lint
```

## 7) Prompting guide for Claude

When asking for a page or component, always provide:

- purpose (what user should do)
- data flow (fetch/mutate, success/failure)
- states (loading/empty/error)
- constraints (mobile-first, a11y)
- expected files (page + components split)
