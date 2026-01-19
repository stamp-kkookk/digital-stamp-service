# Component Creation Prompt

> 재사용 가능한 컴포넌트를 생성할 때 사용하는 command입니다.
> Props 인터페이스, Tailwind 스타일링, 접근성을 고려하여 구현합니다.

---

## Input 필수 항목

### 1. 컴포넌트명
$ARGUMENTS

### 2. 목적
(버튼 / 카드 / 모달 / 리스트 아이템 / 뱃지 / 폼 필드 등)

### 3. Props 인터페이스
(예상되는 props 목록 - 타입 포함)

### 4. UI 참고
(목 디자인 이미지 경로 또는 텍스트 설명)

---

## Output 요구사항

### 1. Props 타입 정의
```typescript
interface {ComponentName}Props {
  // 명시적 prop 인터페이스
}
```

### 2. 컴포넌트 구현
- 함수형 컴포넌트 + TypeScript
- 단일 책임 원칙 준수
- 필요시 forwardRef 적용

### 3. Tailwind 스타일링
- Mobile-first 접근
- 클래스 순서: layout → spacing → size → typography → colors → effects → states
- 3회 이상 반복되는 패턴은 추출

### 4. 접근성 고려사항
- 적절한 `aria-*` 속성
- 키보드 포커스 가시성 (`focus:ring`)
- 스크린 리더 지원

---

## 컴포넌트 배치 규칙

| 위치 | 용도 |
|------|------|
| `src/components/` | 공통 재사용 컴포넌트 |
| `src/features/{feature}/components/` | 피처 전용 컴포넌트 |

---

## 사용 예시

```
/fe-component StampCardItem

목적: 스탬프카드 리스트 아이템 카드

Props:
- name: string (카드 이름)
- stampCount: number (현재 스탬프 수)
- maxStamps: number (최대 스탬프 수)
- status: 'active' | 'inactive'
- onClick: () => void

UI 참고: ./mocks/stampcard-item.png
```

---

## 생성되는 파일

```
src/features/stampcard/components/
└── StampCardItem.tsx
```

또는 공통 컴포넌트인 경우:

```
src/components/
└── StampCardItem.tsx
```

---

## 체크리스트

- [ ] Props 타입 명시적 정의
- [ ] `any` 타입 사용 금지
- [ ] 키보드 포커스 가시적
- [ ] 적절한 aria 속성 적용
- [ ] Tailwind 클래스 순서 정리
- [ ] 불필요한 인라인 style 없음
