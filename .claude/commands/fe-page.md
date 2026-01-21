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

## Output 요구사항

### 1. 페이지 컴포넌트 구조
```
{PageName}Page.tsx
├── {PageName}Container.tsx (데이터 로직)
└── {PageName}View.tsx (프레젠테이션)
```

### 2. Loading/Empty/Error 상태 처리
- **Loading**: 스켈레톤 UI 또는 스피너
- **Empty**: 데이터 없을 때 안내 메시지 + CTA
- **Error**: 에러 메시지 + 재시도 버튼

### 3. 데이터 fetching 로직
- TanStack Query `useQuery` 훅 사용
- Query key 네이밍 규칙 준수
- Stale time / Cache time 설정 (필요시)

### 4. 구현 코드
- TypeScript 타입 정의
- 컴포넌트 구현
- API 호출 함수

---

## 사용 예시

```
/fe-page StampCardListPage

라우트 경로: /o/stores/:storeId/stamp-cards

UI 목 디자인: ./mocks/stampcard-list.png

사용할 API:
- GET /api/owner/stores/{storeId}/stamp-cards
- DELETE /api/owner/stamp-cards/{stampCardId}
```

---

## 생성되는 파일 구조

```
src/features/stampcard/
├── pages/
│   └── StampCardListPage.tsx
├── components/
│   ├── StampCardListContainer.tsx
│   └── StampCardListView.tsx
├── hooks/
│   └── useStampCards.ts
└── api/
    └── stampCardApi.ts
```

