작업 전 다음 파일을 읽으세요:

1. `docs/api-reference.md` - 전체 API 엔드포인트
2. `docs/utility-registry.md` (양쪽 섹션) - 유틸리티 중복 방지
3. `docs/architecture.md` - 시스템 아키텍처
4. `frontend/src/lib/api/endpoints.ts` - API_ENDPOINTS & QUERY_KEYS
5. `frontend/src/types/api.ts` - API DTO 타입
6. 해당 `docs/feature-specs/{feature}.md` - 피처별 명세

워크플로우:
1. `/be-design` - 백엔드 로직 설계
2. `/be-api` - API 인터페이스 설계
3. `/be-impl` - 백엔드 구현
4. `/be-test` - 백엔드 테스트
5. `/fe-feature` - 프론트엔드 피처 설계
6. `/fe-page` 또는 `/fe-component` - 프론트엔드 구현
