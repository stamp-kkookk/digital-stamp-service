작업 전 다음 파일을 읽으세요:

1. `docs/api-reference.md` - 사용 가능한 API 엔드포인트
2. `docs/utility-registry.md` (Frontend 섹션) - 유틸리티 중복 방지
3. `frontend/src/lib/api/endpoints.ts` - API_ENDPOINTS & QUERY_KEYS
4. `frontend/src/types/api.ts` - API DTO 타입
5. 특정 피처 작업 시 `docs/feature-specs/{feature}.md`

참고 Skills:
- `.claude/skills/frontend-core/SKILL.md` - 아키텍처, 코드 스타일, TanStack Query 패턴
- `.claude/skills/design-system/SKILL.md` - Tailwind, 컬러 시스템, 접근성

워크플로우:
1. `/fe-feature` - 피처 전체 설계
2. `/fe-page` - 페이지 생성
3. `/fe-component` - 컴포넌트 생성
4. `/fe-form` - 폼 생성
