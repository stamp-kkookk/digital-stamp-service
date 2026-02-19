# Frontend Guide

Stack: React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Hook Form + Zod

## Commands
```bash
pnpm install                   # 의존성 설치
pnpm dev                       # 개발 서버 (port 5173, /api -> :8080 프록시)
pnpm build                     # 프로덕션 빌드
pnpm lint                      # 린트 검사
```

## Architecture
2 사용자 모드: Customer (`/customer/*`), Owner (`/owner/*`)
패턴: Page -> Container (데이터) -> View (프레젠테이션)
피처: `src/features/{domain}/`, 공통 UI: `src/components/`

## Must-Know Patterns
- API 클라이언트: `src/lib/api/client.ts` (getRaw, postRaw, putRaw, patchRaw, delRaw)
- 엔드포인트: `src/lib/api/endpoints.ts` (API_ENDPOINTS + QUERY_KEYS)
- 토큰 관리: `src/lib/api/tokenManager.ts` (auth + stepUp 토큰)
- 클래스 병합: `cn()` from `src/lib/utils/cn.ts`
- 포맷팅: `src/lib/utils/format.ts` (formatDate, formatTime 등)

## Before Coding
`docs/api-reference.md`와 `docs/utility-registry.md`를 읽고 기존 코드 중복 방지.
Skills: `.claude/skills/frontend-core/`, `.claude/skills/design-system/`
