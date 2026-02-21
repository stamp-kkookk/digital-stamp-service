# KKOOKK Project Guide

## Product
디지털 스탬프/리워드 SaaS. 2 사용자: Customer(모바일 지갑), Owner(백오피스).
POS 미연동. 승인 기반: Customer 요청 -> Owner 백오피스 승인.

## Stack
- backend/ : Spring Boot 3.5, Java 17, JPA, MySQL 8.0 (port 8080)
- frontend/ : React 19, TypeScript, Vite, Tailwind CSS 4 (port 5173)
- docs/ : PRD, API 레퍼런스, 아키텍처, 피처 명세

## 컨텍스트 로딩 (권장)
코드 작업 전 컨텍스트 로더 실행을 권장한다.
사용자가 컨텍스트 로더 없이 작업을 요청하면, 어떤 컨텍스트를 로드할지 질문한다:
- /work-on-backend, /work-on-frontend, /work-on-fullstack, 또는 건너뛰기

## AI Workflow (필수)
1. 설계 (2-3 옵션) -> 2. 리뷰 -> 3. 구현 -> 4. 테스트
코드 작성 전 반드시 설계 단계를 거친다.

## Definition of Done
- 테스트 통과 (백엔드: @MockitoBean 사용, @MockBean 금지)
- 린트 통과 (백엔드: spotlessApply / 프론트: pnpm lint)
- 변경 파일에 TODO 없음
- 예상 실패에 대한 에러 핸들링 존재
- 기존 API 호환성 유지 (명시적 변경 제외)

## 작업 전 참조 문서 (온디맨드 읽기)
- docs/api-reference.md     : 전체 API 엔드포인트
- docs/utility-registry.md  : 재사용 코드 (중복 생성 금지)
- docs/architecture.md      : 시스템 아키텍처
- docs/feature-specs/{기능}.md : 피처별 명세

## Commands
- /work-on-backend, /work-on-frontend, /work-on-fullstack : 작업 전 컨텍스트 로딩
- /be-design, /be-api, /be-impl, /be-review, /be-test : 백엔드 워크플로우
- /fe-feature, /fe-page, /fe-component, /fe-form : 프론트엔드 워크플로우

## 문서 유지보수
API 엔드포인트 추가/수정 시 docs/api-reference.md 업데이트.
유틸리티 추가 시 docs/utility-registry.md 업데이트.
피처 변경 시 docs/feature-specs/{기능}.md 업데이트.
