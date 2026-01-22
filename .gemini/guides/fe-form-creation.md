# Gemini 가이드: 프론트엔드 폼 생성

## Summary
- **Objective**: Use this guide to create robust, validated forms using React Hook Form and Zod.
- **Trigger**: When asked to create a new frontend form.
- **Input**: Form name, field list with validation rules, submission API endpoint.

## 1. 폼 생성 요청 접수 시 확인 사항

새로운 프론트엔드 폼 생성 요청을 받으면, 다음 정보를 확인합니다.

1.  **폼 이름**: 생성할 폼의 이름은 무엇인가요?
2.  **필드 목록**: 폼에 포함될 필드의 이름, 타입, 그리고 구체적인 유효성 검사 규칙은 무엇인가요?
3.  **제출 API**: 폼 데이터를 제출할 백엔드 API 엔드포인트(메서드 + 경로)는 무엇인가요?
4.  **UI 참고 자료 (선택)**: 폼의 디자인을 참고할 수 있는 목업 이미지가 있나요?

## 2. 폼 구현 가이드

폼 구현 시 다음 순서와 규칙을 준수합니다.

### 2.1. Zod 스키마 정의
*   폼 데이터의 유효성을 검사하기 위한 Zod 스키마를 별도의 파일(`schemas/...`)에 정의합니다.
*   각 필드에 대한 유효성 검사 규칙과 사용자 친화적인 한글 에러 메시지를 명시합니다.

```typescript
// 예시: src/features/stampcard/schemas/stampCardSchema.ts
import { z } from 'zod';

export const stampCardSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  maxStamps: z.number().min(1, '최소 1개 이상이어야 합니다.'),
});

export type StampCardFormData = z.infer<typeof stampCardSchema>;
```

### 2.2. 데이터 제출 로직 구현 (`useMutation`)
*   `TanStack Query`의 `useMutation` 훅을 사용하여 폼 제출 로직을 구현합니다.
*   이 훅은 `api/...`에 정의된 API 호출 함수를 사용합니다.
*   `onSuccess` 콜백에서 폼 리셋, 페이지 이동, 성공 토스트 메시지 표시 등의 후처리를 수행합니다.
*   `onError` 콜백에서 서버 에러를 처리합니다.

### 2.3. 폼 컴포넌트 구현
*   **`useForm` 훅 설정**:
    *   `react-hook-form`의 `useForm` 훅을 사용하여 폼 상태를 관리합니다.
    *   `zodResolver`를 연동하여 Zod 스키마와 연결합니다.
    *   `defaultValues`를 설정합니다.
*   **필드 렌더링**:
    *   `Controller` 컴포넌트나 `register` 함수를 사용하여 각 입력 필드를 폼 상태와 연결합니다.
    *   모든 입력 필드에는 `label`과 `htmlFor`를 연결하여 접근성을 준수합니다.
*   **에러 메시지 표시**:
    *   `formState.errors` 객체를 참조하여 각 필드 바로 아래에 유효성 검사 에러 메시지를 표시합니다.
*   **제출 처리**:
    *   `handleSubmit` 함수로 폼 제출 로직을 감쌉니다.
    *   `formState.isSubmitting` 상태를 사용하여 제출 중에는 버튼을 비활성화하고 로딩 인디케이터를 표시하여 중복 제출을 방지합니다.
*   **서버 에러 처리**:
    *   `useMutation`의 `onError` 콜백에서 API 응답으로 받은 필드별 에러가 있을 경우, `setError` 함수를 사용하여 해당 필드에 에러 메시지를 수동으로 설정합니다.

### 2.4. 파일 구조
*   관련 파일들을 기능별 디렉토리(`src/features/{feature}/`) 아래에 구성합니다.

```
src/features/{feature}/
├── components/
│   └── {FormName}.tsx         # 폼 컴포넌트
├── schemas/
│   └── {formName}Schema.ts    # Zod 스키마
└── hooks/
    └── useCreate{Feature}.ts  # useMutation 훅
```

## 3. 필수 체크리스트
- [ ] Zod 스키마에 모든 유효성 검사 규칙과 에러 메시지가 정의되었는가?
- [ ] `react-hook-form`과 `zodResolver`가 올바르게 설정되었는가?
- [ ] 모든 입력 필드에 `label`과 `htmlFor`가 연결되었는가?
- [ ] 필드별 클라이언트 및 서버 에러 메시지가 올바르게 표시되는가?
- [ ] 폼 제출 중 중복 제출이 방지되고 로딩 상태가 표시되는가?
- [ ] 폼 제출 성공/실패 시 사용자에게 명확한 피드백(토스트 메시지 등)을 제공하는가?
