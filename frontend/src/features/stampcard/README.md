# Stamp Card Feature

Owner Backoffice용 스탬프 카드 생성 및 관리 기능

## 📁 Directory Structure

```
features/stampcard/
├── api/
│   └── stampCardApi.ts          # API 호출 함수
├── components/
│   ├── DesignStudioPanel.tsx    # 좌측 디자인 스튜디오 패널
│   ├── PreviewPanel.tsx          # 중앙 미리보기 + 시뮬레이터 패널
│   └── RulesPanel.tsx            # 우측 규칙 설정 패널
├── hooks/
│   └── useStampCardCreation.ts  # 스탬프 카드 생성 커스텀 훅
├── pages/
│   └── StampCardCreationPage.tsx # 메인 페이지 컴포넌트
└── README.md
```

## 🎨 Features

### 1. Design Studio (좌측 패널)

**Mode Selection:**
- **일반 모드 (Custom)**: 배경 이미지 + 빈/찍힌 스탬프 아이콘 업로드
- **퍼즐 모드 (Puzzle)**: 퍼즐 이미지 업로드 + 그리드 크기 선택 (2x2, 3x3, 4x4, 5x4)

**Custom Mode:**
- 배경 이미지 업로드
- 빈 스탬프 아이콘 업로드
- 찍힌 스탬프 아이콘 업로드
- 전체 스탬프 개수: 4~20개 (슬라이더)

**Puzzle Mode:**
- 퍼즐 그리드 크기 선택: 2x2, 3x3, 4x4, 5x4
- 퍼즐 이미지 업로드
- 랜덤 섞기 버튼 (UI mock)

### 2. Preview Panel (중앙 패널)

**Toggle Modes:**
- **Design**: 디자인 미리보기만 표시
- **Simulator**: 실시간 시뮬레이션 (스탬프 적립 테스트)

**Preview Card:**
- 크기: `width: min(340px, 92vw)`, `height: min(680px, 75vh)`
- 깔끔한 카드 스타일 (디바이스 프레임 없음)
- 카드 제목 + 리워드 명 표시
- 스탬프 진행 상태 표시

**Simulator:**
- "스탬프 적립" 버튼: 300ms 더블탭 방지
- Reset 버튼: 진행 상태 초기화
- 완료 시: "리워드 쿠폰 받기" 버튼으로 변경

**Puzzle Reveal:**
- Fisher-Yates 알고리즘으로 랜덤 순서 생성
- 타일 공개 시 이미지 조각 표시
- 잠긴 타일: Navy 그라데이션 (순수 검은색 아님)
- 공개된 타일: 퍼즐 이미지 조각 또는 Yellow (#FFD600) fallback

### 3. Rules Panel (우측 패널)

**Input Fields:**
- 카드 제목 (필수, 최대 100자)
- 리워드 명 (선택, 최대 255자)
- 리워드 수량 (선택, 최소 1)
- 리워드 유효기간 (선택, 최소 1일)

**Real-time Sync:**
- 카드 제목과 리워드 명은 중앙 미리보기에 실시간 반영

### 4. Header Actions

**임시 저장 (Save Draft):**
- 상태: `DRAFT`
- 검증 후 백엔드에 저장
- 언제든 수정 가능

**발행 (Publish):**
- 2단계 프로세스:
  1. `DRAFT` 상태로 생성
  2. `ACTIVE` 상태로 변경 (발행)
- 확인 모달 표시
- 발행 후 일부 항목만 수정 가능

## 🔌 API Integration

### Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/owner/stores/{storeId}/stamp-cards` | 스탬프 카드 생성 (DRAFT) |
| PATCH | `/api/owner/stores/{storeId}/stamp-cards/{id}/status` | 상태 변경 (Publish) |

### Request DTOs

**CreateStampCardRequest:**
```typescript
{
    title: string              // 필수, 1-100자
    goalStampCount: number     // 필수, 1-50
    requiredStamps?: number    // 선택, 1-50
    rewardName?: string        // 선택, 최대 255자
    rewardQuantity?: number    // 선택, 최소 1
    expireDays?: number        // 선택, 최소 1
    designJson?: string        // 선택, JSON 문자열
}
```

**Design JSON Format:**
```typescript
{
    mode: 'custom' | 'puzzle'
    // Custom mode
    backgroundImage?: string
    emptyIcon?: string
    stampIcon?: string
    // Puzzle mode
    puzzleGrid?: '2x2' | '3x3' | '4x4' | '5x4'
    puzzleImage?: string
}
```

## 🎨 Design System Compliance

### Colors (KKOOKK Owner Palette)

- **Primary**: Indigo `#2E58FF`
- **CTA**: Orange `#FF4D00`
- **Background**: Paper `#FAF9F6`
- **Text**: Navy `#1A1C1E`
- **Secondary Text**: Steel `#64748B`
- **Container**: Sand `#F5F5F0`
- **Puzzle Fallback**: Yellow `#FFD600`

### Typography

- **Heading 1**: `text-xl font-semibold` (20px, 600)
- **Body 1**: `text-base font-medium` (16px, 500)
- **Body 2**: `text-sm` (14px, 400)
- **Caption**: `text-xs` (12px, 400)

### Components

- **Buttons**: `h-14` (56px) for reliable touch targets
- **Border Radius**: `rounded-2xl` (16px) for cards and inputs
- **Focus Ring**: `focus:ring-4 focus:ring-kkookk-orange-500/30`
- **Active State**: `active:scale-95` for tactile feedback

### Responsive Breakpoints

- **Mobile**: default (< 1024px)
- **Desktop**: `lg:` (≥ 1024px)

**Layout:**
- Mobile: Vertical stack (Left → Center → Right)
- Desktop: 3-column horizontal (Left 320px | Center fluid | Right 320px)

## 🧪 Validation

### Form Validation

- **카드 제목**: 필수, 1-100자
- **스탬프 개수**: 4-20개
- **리워드 명**: 선택, 최대 255자
- **리워드 수량**: 선택, 최소 1
- **유효기간**: 선택, 최소 1일

### UX Error Handling

- 검증 실패 시 상단에 빨간색 에러 메시지 표시
- 에러 배경: `bg-kkookk-red/10`
- 에러 텍스트: `text-kkookk-red`

## 🚀 Usage

### Route Access

```
/o/stores/:storeId/stamp-cards/create
```

**Example:**
```
/o/stores/123/stamp-cards/create
```

### Development

```bash
# Frontend 디렉토리에서
npm run dev

# 브라우저에서 접속
http://localhost:5173/o/stores/1/stamp-cards/create
```

### Build

```bash
npm run build
```

## 📝 TODOs

- [ ] 이미지 업로드 최적화 (리사이징, 압축)
- [ ] 디바운싱 적용 (카드 제목, 리워드 명 입력)
- [ ] 저장 성공 시 Toast 알림
- [ ] 에러 바운더리 추가
- [ ] Loading Skeleton UI
- [ ] Empty State 처리
- [ ] 스탬프 카드 수정 페이지
- [ ] 스탬프 카드 목록 페이지

## 🔗 Related Files

- `/src/types/stampCard.ts` - TypeScript 타입 정의
- `/src/lib/apiClient.ts` - Axios 클라이언트 설정
- `/src/index.css` - Tailwind CSS 커스텀 색상 정의

## 📚 References

- [Backend API Spec](../../../backend/src/main/java/com/project/kkookk/controller/stampcard/StampCardApi.java)
- [Design System](../../../.claude/skills/design-system/SKILL.md)
- [Frontend Core](../../../.claude/skills/frontend-core/SKILL.md)
