## 공통

### 1. 네이밍/파일 표준 통일
    * 파일명: CLAUDE.md (commands나 rules는 소문자와 -로 만들기 ex. fe-component.md) 
    * 폴더: .claude/, .claude/rules/, .claude/commands/


### 2. 문서 구조
```
your-project/
├─ client/
│  ├─ CLAUDE.md
│  └─ src/...
├─ server/
│  ├─ CLAUDE.md
│  └─ src/...
└─ .claude/
   ├─ CLAUDE.md              # 프로젝트 공통(얇게)
   ├─ rules/
   │  ├─ general.md
   │  ├─ frontend/...
   │  └─ backend/...
   └─ commands/
      ├─ fe-component.md
      ├─ fe-page.md
      ├─ be-controller-service.md
      ├─ be-api-design.md
      └─ debug-issue.md
```
얇은 공통 + 두꺼운 세부 원칙

- `.claude/CLAUDE.md` : **목차 + 공통 규칙 + 팀 운영 방식(최소한)**
- `/client/CLAUDE.md` : **프론트만의 실행/구조/가드레일**
- `/server/CLAUDE.md` : **백엔드만의 실행/구조/가드레일**
- `.claude/rules/*` : 규칙을 **파일로 쪼개서** 변경 diff가 명확하게

### 3. 규칙 변경 운영 방식
룰 변경 프로세스 (권장)
1. 규칙 변경은 docs 브랜치 PR로만 반영
2. PR 템플릿에 “규칙 변경 요약 + 영향 범위 + 적용 예시” 필수


### 4. 컨텍스트 제공 규칙
프롬프트 작성할 때 참고할 내용
1. 현재 문제와 관련된 파일 목록이나 구조를 설명하기
2. 맥락을 점진적으로 추가 공급하기
3. 큰 기능을 개발할 때 설계 논의, 코딩, 테스트/디버깅 단계를 별도의 컨텍스트로 진행한다.<br>
-> /clear를 통해 각 단계마다 컨텍스트를 비우기
4. 필요한 맥락만 집중해서 제공한다. 전체 파일보다는 관련 코드 스니펫(메서드)만 제공하기
5. 코드 바로 요구 x, 사전에 설계와 추론을 이끌어내는 프롬프트 전략 먼저 세우기<br>
ex) Claude에게 먼저 여러 가지 설계 옵션과 장단점을 검토하게  한 후, 구현하도록 지시하기

### 5. 설계 → 검토 → 구현을 강제하는 AI 워크플로우

팀 표준 워크플로우 (강제 권장)
1. 설계안 2~3개 제시
2. 각각의 장단점 + 리스크
3. 추천안 1개 확정(팀이 결정)
4. 구현(Diff / 파일 단위로)
5. 테스트/검증 항목까지 생성


> ex) 코드부터 작성하지 말고, 먼저 설계 옵션 3개와 트레이드오프를 표로 정리해줘. 합의 후 구현할게.

### 6. .claude/commands 도입 기준 (반복 업무 자동화)
팀프로젝트에서 매번 나오는 반복은 팀 생산성을 위해 commands로 만든다.<br>

> ex) debug-issue.md : 에러 로그 기반 원인 추적 + 재현 스텝 + 해결책

### 7. Skills를 적극적으로 사용하기
- Frontend Design (공식 프론트엔드 디자인 보조 스킬)
- Spring Boot Engineer (by Jeffallan) – Spring 전문 개발자 스킬
- Superpowers (by obra) – 개발 워크플로우 향상 툴킷

## Frontend 컨벤션 고도화

### 1. UI 구현 프롬프트는 설계정보가 70%

AI가 UI를 잘 만들게 하려면 예쁘게가 아니라
컴포넌트 규칙 + 상태/에러 + 접근성 조건이 들어가야 한다.

꼭 포함할 정보 체크리스트
1. 화면 목적(유저가 여기서 뭘 해야 함?)
2. 데이터 흐름(조회/저장/실패 시)
3. 상태(loading/empty/error)
4. 접근성(a11y: aria-label, focus 이동, 키보드 탐색)
5. 스타일 규칙(Spacing scale, 버튼 variant, 폰트 크기)

### 2. UX 개선점도 같이 묻기
> ex) 사용자가 실수하기 쉬운 포인트를 먼저 예측하고, UI에서 예방해줘.

### 3. 목업 기반 개발 루프 (이미지 → 구현 → 비교)

프론트 AI 루프 추천
1. 목업 이미지 제공
2. 레이아웃 → 컴포넌트 분해 → Tailwind 클래스 순서로 작성
3. 캡처 비교 후 차이점만 수정 지시 (2~3회 반복)
3. 마지막에 “리팩터링/재사용 구조”로 정리

### 4. frontend rule 
```
frontend/
         ├─ 00-frontend-scope.md
         ├─ 01-frontend-stack.md
         ├─ 02-frontend-code-style.md
         ├─ 03-react-components.md
         ├─ 04-tailwind-style.md
         ├─ 05-state-data-fetching.md
         ├─ 06-api-integration.md
         ├─ 07-routing-navigation.md
         ├─ 08-forms-validation.md
         ├─ 09-a11y.md
         ├─ 10-testing.md
         ├─ 11-performance.md
         ├─ 12-security-privacy.md
         └─ 99-frontend-pr-checklist.md
```
실제 코드베이스에 따라 수정될 수 있음

### 5. 프론트 실전 프롬프트 예시
예시 1) “페이지 1개 구현”
```
[목표] 스탬프 카드 목록 페이지를 구현해줘
[현재 상태] /pages, /components/ui 구조가 있고 Tailwind 사용 중이야
[제약] 로딩/에러/빈 상태 필수, 키보드 접근 가능해야 함
[원하는 결과물] Page 컴포넌트 + 리스트 컴포넌트 분리
[검증] 더미 데이터로 렌더링 확인 가능해야 함
[주의] 라우팅 구조는 건드리지 말 것

추가 요구:
- 사용자가 “카드가 없다” 상황에서도 행동할 CTA 버튼 제공
- 접근성(aria-label, focus ring) 포함
```

예시 2) “리팩터링”
```
이 컴포넌트가 너무 비대해. 
1) UI / 로직을 분리하고
2) 상태 분기(loading/empty/error)를 정리하고
3) 중복 클래스를 variant로 추출해줘.
변경은 최소 diff로 보여줘.
```

## Backend 컨벤션 고도화

### 1. 다음 과정을 항상 지키기
1. 필요한 API 엔드포인트 설계 ( 엔드포인트, 권한, status code, Request/Response DTO )
2. 데이터베이스 모델 정의 ( ERD 초안(테이블/필드/인덱스))
3. 각 엔드포인트별 기능 구현
4. 테스트/검증 (테스트 시나리오)
5. 보안 고려사항 찾아내기


### 2. 고정된 표준 출력 형식 이용하기 (설계시)

나열 후 검토하고 코드 작성 진행하기. 이 때, 나열되는 정보를 AI에게 강제하기

백엔드 표준 출력 포맷 (AI에게 강제)
1) API 엔드포인트 목록(REST)
2) 각 엔드포인트 Req/Res DTO
3) DB 모델(테이블/컬럼)
4) 예외/검증 로직
5) 구현 순서(Controller → Service → Repository)
6) 테스트 케이스(성공/실패)
7) 보안 체크리스트

### 3. 백엔드 실전 프롬프트 예시

예시 1) “엔드포인트 설계부터”
```
[목표] 스탬프 적립 요청 API를 설계해줘
[현재 상태] 회원/가게/스탬프카드가 존재하고, 승인형 플로우야
[제약] MVP 우선(가볍게), JPA 기반
[원하는 결과물] API 목록 + DTO + 예외/검증 + 간단한 테이블 구조
[검증] 테스트 케이스까지 제시
[주의] 불필요한 확장 설계 금지

코드 작성하지 말고 설계부터 출력해줘.
```

예시 2) “구현 요청 (최소 diff)”

```
위에서 확정한 설계대로
Controller/Service/Repository/DTO를 생성해줘.
- Validation 포함
- 예외 처리 포함
- 단위 테스트 2개 이상 포함
출력은 파일 단위로 나눠줘.
```

