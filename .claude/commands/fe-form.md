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

## 참조 문서 (작업 전 확인)

- `docs/api-reference.md` - 제출 API 엔드포인트 확인
- `docs/utility-registry.md` (Frontend 섹션) - 기존 폼/훅 중복 방지
- `frontend/src/lib/api/endpoints.ts` - API_ENDPOINTS
- `frontend/src/types/api.ts` - 기존 DTO 타입
- `.claude/skills/frontend-core/SKILL.md` - 폼 패턴, 코드 스타일
- `.claude/skills/design-system/SKILL.md` - Input 컴포넌트, 접근성

---

## Output 요구사항

### 1. Zod 스키마
```typescript
const {formName}Schema = z.object({
  // 필드 정의 + 검증 규칙 + 한글 에러 메시지
})
type {FormName}FormData = z.infer<typeof {formName}Schema>
```

### 2. React Hook Form 설정
- `useForm` 훅 + `zodResolver` 연동
- 기본값 설정

### 3. 폼 컴포넌트 구현
- 필드별 입력 컴포넌트 (UI Input 활용)
- label + htmlFor 연결
- 필드 아래 에러 메시지 표시

### 4. 제출 중 상태 및 중복 제출 방지
- 제출 중 버튼 disabled + 로딩 인디케이터
- useMutation + onSuccess/onError 처리

### 5. 서버 에러 필드 연동
- API 응답 필드별 에러를 `setError`로 연결
- 한글 에러 메시지 변환

---

## 필드 타입 가이드

| 타입 | 컴포넌트 | Zod 검증 예시 |
|------|----------|---------------|
| text | `<Input type="text">` | `z.string().min(1)` |
| email | `<Input type="email">` | `z.string().email()` |
| number | `<Input type="number">` | `z.number().positive()` |
| select | `<select>` | `z.enum([...])` |
| checkbox | `<input type="checkbox">` | `z.boolean()` |
| textarea | `<textarea>` | `z.string().max(500)` |

---

## 생성되는 파일 구조

```
src/features/{feature}/
├── components/
│   └── {FormName}Form.tsx
├── schemas/
│   └── {formName}Schema.ts
└── hooks/
    └── use{Action}.ts
```

---

## 체크리스트

- [ ] 모든 필드에 label + htmlFor 연결
- [ ] 필드별 에러 메시지 표시 (한글)
- [ ] 키보드 제출 (Enter) 지원
- [ ] 제출 중 중복 방지 (disabled + isLoading)
- [ ] 성공/실패 피드백 표시 (Toast)
- [ ] `docs/utility-registry.md`에 등록된 기존 폼/훅과 중복 없음
