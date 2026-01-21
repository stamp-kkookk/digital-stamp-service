# Form Creation Prompt

> React Hook Form + Zod 기반 폼을 생성할 때 사용하는 command입니다.
> 유효성 검사, 에러 처리, 중복 제출 방지를 포함합니다.

---

## Input 필수 항목

### 1. 폼명
$ARGUMENTS

### 2. 필드 목록
(필드명, 타입, 검증규칙)

### 3. 제출 API
(엔드포인트 - 메서드 + 경로)

### 4. UI 참고 (선택)
(목 디자인 이미지 경로)

---

## Output 요구사항

### 1. Zod 스키마
```typescript
const {formName}Schema = z.object({
  // 필드 정의 + 검증 규칙
});

type {FormName}FormData = z.infer<typeof {formName}Schema>;
```

### 2. React Hook Form 설정
- `useForm` 훅 설정
- `zodResolver` 연동
- 기본값 설정

### 3. 폼 컴포넌트 구현
- 필드별 입력 컴포넌트
- 레이블 + htmlFor 연결
- 에러 메시지 표시 위치

### 4. 필드별 에러 메시지 처리
- 각 필드 바로 아래 에러 표시
- 사용자 친화적 한글 메시지

### 5. 제출 중 상태 및 중복 제출 방지
- 제출 중 버튼 disabled
- 로딩 인디케이터 표시
- useMutation + onSuccess/onError 처리

---

## 필드 타입 가이드

| 타입 | 컴포넌트 | Zod 검증 예시 |
|------|----------|---------------|
| text | `<input type="text">` | `z.string().min(1)` |
| email | `<input type="email">` | `z.string().email()` |
| number | `<input type="number">` | `z.number().positive()` |
| select | `<select>` | `z.enum([...])` |
| checkbox | `<input type="checkbox">` | `z.boolean()` |
| textarea | `<textarea>` | `z.string().max(500)` |

---

## 사용 예시

```
/fe-form StampCardCreateForm

필드 목록:
- name: string, 필수, 최소 2자 ~ 최대 50자
- description: string, 선택, 최대 200자
- maxStamps: number, 필수, 1~20 범위
- rewardName: string, 필수, 최소 1자
- status: 'active' | 'inactive', 기본값 'active'

제출 API: POST /api/owner/stores/{storeId}/stamp-cards

UI 참고: ./mocks/stampcard-create-form.png
```

---

## 생성되는 파일 구조

```
src/features/stampcard/
├── components/
│   └── StampCardCreateForm.tsx
├── schemas/
│   └── stampCardSchema.ts
└── hooks/
    └── useCreateStampCard.ts
```

---

## 에러 메시지 예시

```typescript
const stampCardSchema = z.object({
  name: z.string()
    .min(2, '카드 이름은 2자 이상이어야 합니다')
    .max(50, '카드 이름은 50자를 초과할 수 없습니다'),
  maxStamps: z.number()
    .min(1, '최소 1개 이상이어야 합니다')
    .max(20, '최대 20개까지 설정 가능합니다'),
});
```

---

## 체크리스트

- [ ] 모든 필드에 label + htmlFor 연결
- [ ] 필드별 에러 메시지 표시
- [ ] 키보드 제출 (Enter) 지원
- [ ] 폼 리셋 기능 (필요시)
- [ ] 성공/실패 피드백 표시
