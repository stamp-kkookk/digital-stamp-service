# Gemini 가이드: 백엔드 로직 설계 체크리스트

## Summary
- **Objective**: Use this guide to design complex backend business logic, considering multiple implementation options and their trade-offs.
- **Trigger**: When a feature requires complex business logic, orchestration of multiple services, or has significant architectural impact.
- **Output Format**: Propose 1-2 design options, each detailing logic, data flow, and trade-offs. Recommend one option.

## 1. 복잡한 로직 설계 시 분석 항목

복잡한 백엔드 기능에 대한 설계 요청을 받으면, 다음 항목들을 체계적으로 분석하고 구조화해야 합니다.

### 1.1. Feature Analysis (기능 분석)
- **User Story**: As a {user type}, I want to {action} so that {benefit}.
- **Acceptance Criteria**: What conditions must be met for this feature to be considered complete? (기능이 완료되기 위한 조건은 무엇인가?)
- **Constraints & Edge Cases**: Are there any technical limitations, business rules, or edge cases to consider? (기술적/정책적 제약사항이나 엣지 케이스는 무엇인가?)

### 1.2. High-Level Logic Flow (상위 수준 로직 흐름)
- **Actors**: Who are the main actors involved? (e.g., Customer, Owner, System) (주요 행위자는 누구인가?)
- **Steps**: What are the sequential steps in the process from start to finish? (시작부터 끝까지의 순차적인 단계는 무엇인가?)
- **Dependencies**: What other services, repositories, or external systems are involved? (관련된 다른 서비스, 리포지토리, 외부 시스템은 무엇인가?)

### 1.3. Data Flow & Schema (데이터 흐름 및 스키마)
- **Data Input**: What data is required to start the process? (프로세스를 시작하는데 필요한 데이터는 무엇인가?)
- **Data Output**: What data is produced at the end of the process? (프로세스가 끝났을 때 생성되는 데이터는 무엇인가?)
- **DB Schema Changes**: Does this require new tables, columns, or indexes? (새로운 테이블, 컬럼, 인덱스가 필요한가?)

## 2. 설계 옵션 제안 형식

분석이 끝나면, 1-2개의 구체적인 설계 옵션을 다음 형식에 맞춰 제안합니다.

### 옵션 1: {설계_옵션_이름} (예: 동기 처리 방식)

#### Service Logic
- **`ServiceA`**: {책임과 로직 설명}
- **`ServiceB`**: {책임과 로직 설명}
- **`Orchestration`**: 두 서비스가 어떻게 상호작용하는지에 대한 설명.

#### Trade-offs (장단점)
- **Pros (장점)**: {이 설계의 장점}
- **Cons (단점)**: {이 설계의 단점}
- **Risks (위험 요소)**: {잠재적인 위험 요소}

### 옵션 2: {설계_옵션_이름} (예: 비동기 이벤트 기반 방식)

#### Service Logic
- ...

#### Trade-offs (장단점)
- ...

## 3. 최종 제안

각 옵션의 장단점을 비교 분석한 후, 가장 합리적이라고 생각하는 **하나의 옵션을 추천**하고 그 이유를 설명합니다.
