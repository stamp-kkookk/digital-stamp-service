# Page Creation Prompt

> 단일 페이지를 생성할 때 사용하는 command입니다.
> 라우트 레벨 컴포넌트와 데이터 fetching 로직을 함께 구현합니다.

---

## Input 필수 항목

### 1. 페이지명
$ARGUMENTS

### 2. 라우트 경로
(예: `/o/stores/:storeId/stamp-cards`, `/c/wallet`)

### 3. UI 목 디자인
(이미지 파일 경로 또는 텍스트 설명)

### 4. 사용할 API
(엔드포인트 목록 - 메서드 + 경로)

---

## 참조 문서 (작업 전 확인)

- `docs/api-reference.md` - API 엔드포인트 확인
- `docs/utility-registry.md` (Frontend 섹션) - 기존 코드 중복 방지
- `docs/feature-specs/{feature}.md` - 해당 피처 명세
- `frontend/src/lib/api/endpoints.ts` - API_ENDPOINTS & QUERY_KEYS
- `frontend/src/types/api.ts` - API DTO 타입
- `.claude/skills/frontend-core/SKILL.md` - Page/Container/View 패턴
- `.claude/skills/design-system/SKILL.md` - 페이지 타입별 가이드 (Owner/Customer/Terminal)

---

## Output 요구사항

### 1. 페이지 컴포넌트 구조
```
{PageName}Page.tsx
├── {PageName}Container.tsx (데이터 로직)
└── {PageName}View.tsx (프레젠테이션)
```

### 2. Loading / Empty / Error 상태 처리
- **Loading**: 스켈레톤 UI 또는 스피너
- **Empty**: 데이터 없을 때 안내 메시지 + CTA
- **Error**: 에러 메시지 + 재시도 버튼

### 3. 데이터 fetching 로직
- TanStack Query `useQuery` 사용
- QUERY_KEYS 기준 캐시 키 설정
- staleTime / refetchInterval 설정 (필요시)

### 4. 라우팅 설정 등록
- React Router 설정에 페이지 + 경로 등록
- Route Grouping: `/c/*` (customer), `/o/*` (owner), `/t/*` (terminal)

### 5. 페이지 타입별 레이아웃
- **Customer**: 모바일 퍼스트, 하단 고정 CTA
- **Owner**: 데스크톱 퍼스트, 2-3 컬럼 그리드
- **Terminal**: 센터 정렬, 큰 요소, 승인/거절 병렬

---

## 생성되는 파일 구조

```
src/features/{feature}/
├── pages/
│   └── {PageName}Page.tsx
├── components/
│   ├── {PageName}Container.tsx
│   └── {PageName}View.tsx
├── hooks/
│   └── use{DataName}.ts
└── api/
    └── {feature}Api.ts
```

---

## 체크리스트

- [ ] Loading / Empty / Error 상태 존재
- [ ] 키보드 네비게이션 동작
- [ ] 페이지 타입(Customer/Owner/Terminal)에 맞는 레이아웃
- [ ] 불필요한 re-render / infinite loop 없음
- [ ] API 에러 핸들링 존재
- [ ] `docs/utility-registry.md`에 등록된 기존 코드와 중복 없음
