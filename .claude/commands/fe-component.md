# Component Creation Prompt

> 재사용 가능한 컴포넌트를 생성할 때 사용하는 command입니다.

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
- forwardRef 적용 기준: DOM 접근 필요 시 (input focus, scroll 등)

### 3. 스타일링 적용 (Design System 준수)
- `design-system/SKILL.md`에 명시된 Tailwind CSS 클래스 정렬 규칙, KKOOKK 컬러 시스템, `twMerge` 활용 등을 준수
- Mobile-first 접근 방식 적용

### 4. 컴포넌트 내부 구성 순서 준수 (Frontend Core Skill 참조)
- `frontend-core/SKILL.md`에 명시된 State, Memoization, Side effects, Event handlers, JSX Rendering 순서 준수

---

## 컴포넌트 배치 규칙

| 위치 | 용도 | 판단 기준 |
|------|------|----------|
| `src/components/` | 공통 재사용 컴포넌트 | 2개 이상 피처에서 사용 |
| `src/features/{feature}/components/` | 피처 전용 컴포넌트 | 해당 피처에서만 사용 |

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
- [ ] 접근성(A11y) 가이드라인 준수 (Design System 참조)
- [ ] 변수 및 Props명에 약어 사용 금지 (Frontend Core Skill 참조)
