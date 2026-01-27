# 🔗 빠른 테스트 URL 목록

> 개발 서버 실행: `npm run dev`
> 기본 주소: `http://localhost:5173`

---

## 📱 Customer 영역

| 페이지 | URL | 주요 체크 사항 |
|--------|-----|--------------|
| **매장 진입 (스탬프카드 있음)** | `/c/store/1` | PhoneInput, OtpInput, Card 컴포넌트 |
| **매장 진입 (스탬프카드 없음)** | `/c/store/3` | EmptyView 컴포넌트 |
| **회원가입/로그인** | `/c/store/1/auth` | 폼 플로우, Input 컴포넌트 |

**테스트 데이터**:
- 전화번호: `01012345678`
- OTP: `123456`
- 이름: `홍길동` / 닉네임: `길동이`

---

## 🖥️ Terminal 영역

| 페이지 | URL | 주요 체크 사항 |
|--------|-----|--------------|
| **로그인** | `/t/login` | Button, Input 컴포넌트 |
| **매장 선택** | `/t/stores` | Card elevated variant |
| **발급 대시보드** | `/t/issuance/1` | Badge, Button, Table 컴포넌트 |

**테스트 데이터**:
- 터미널 계정: `admin` / `1234`

---

## 👨‍💼 Owner 영역

| 페이지 | URL | 주요 체크 사항 |
|--------|-----|--------------|
| **매장 목록** | `/o/stores` | Card, Button 컴포넌트 |
| **매장 등록** | `/o/stores/new` | 3단계 마법사, 모든 폼 컴포넌트 |
| **스탬프카드 목록** | `/o/stores/1/stamp-cards` | Table, Badge, EmptyState |
| **스탬프카드 생성** | `/o/stores/1/stamp-cards/create` | 폼 컴포넌트 전체 |

**테스트 데이터**:
- 매장명: `꾸욱카페 테스트점` / 카테고리: `카페`
- 스탬프카드: `오픈 기념 이벤트` / 최대: `10개` / 리워드: `아메리카노 1잔`

---

## 🎨 핵심 확인 사항

### 1. 디자인 토큰 (모든 페이지)
- ✅ `kkookk-orange`, `kkookk-indigo`, `kkookk-navy`, `kkookk-steel` 사용
- ❌ `gray-*`, `blue-*` 클래스 **사용 금지**

### 2. 공통 컴포넌트 스타일
- **Button**: h-14, rounded-2xl, 5가지 variant
- **Input**: h-14, rounded-2xl, focus ring
- **Card**: rounded-2xl, shadow-sm
- **Badge**: rounded-full, 색상 variant

### 3. 필수 동작 테스트
- [ ] Customer: 전화번호 입력 → OTP → 회원가입 완료
- [ ] Terminal: 로그인 → 매장 선택 → 발급 대시보드
- [ ] Owner: 매장 등록 3단계 완료

---

## 🐛 에러 상태 확인

**네트워크 에러 시뮬레이션**:
1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭 → Throttling → Offline
3. 페이지 새로고침
4. ErrorView 표시 확인

---

## 📸 스크린샷 체크 포인트

프로젝트 문서화를 위해 다음 페이지 스크린샷 권장:
1. `/c/store/1` - Customer 매장 진입
2. `/c/store/1/auth` - 회원가입 Step 1 (전화번호 입력)
3. `/t/issuance/1` - Terminal 발급 대시보드
4. `/o/stores/new` - Owner 매장 등록 마법사
5. `/o/stores/1/stamp-cards` - 스탬프카드 목록

---

## ⚡ 빠른 시작

```bash
# 1. 개발 서버 실행
cd frontend
npm run dev

# 2. 브라우저에서 테스트 시작
# Chrome 권장: http://localhost:5173

# 3. 주요 페이지 순서대로 확인
# → Customer: /c/store/1
# → Terminal: /t/login → /t/stores → /t/issuance/1
# → Owner: /o/stores → /o/stores/new
```

---

## 📋 상세 체크리스트

전체 체크리스트는 `MANUAL_TEST_CHECKLIST.md` 참조
