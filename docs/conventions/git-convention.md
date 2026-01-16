# Git 브랜치 전략 (Git Branch Strategy)

우리 프로젝트는 **Git-Flow**를 기반으로 하되, 복잡성을 줄이기 위해 핵심적인 브랜치들만 사용하는 약식 전략을 따릅니다. 

## 1. 메인 브랜치 (Main Branches)

항상 유지되는 프로젝트의 중심 브랜치입니다.

- **main**: 제품으로 출시될 수 있는 상태의 코드를 관리합니다. 가장 안정적인 상태를 유지해야 합니다.
- **develop**: 다음 출시 버전을 위해 개발 중인 코드가 통합되는 브랜치입니다. 모든 기능 개발의 시작점입니다.

## 2. 서브 브랜치 (Sub Branches)


특정 목적을 위해 생성하고, 작업이 끝나면 `develop` 브랜치에 병합(Merge)한 후 삭제합니다.

- **feature**: 새로운 기능을 개발할 때 사용합니다.
    - **분기점**: `develop`
    - **병합 대상**: `develop`
    - **이름 규칙**: `feature/기능명` (예: `feature/login-api`)
- **bug**: 발견된 버그를 수정할 때 사용합니다.
    - **분기점**: `develop`
    - **병합 대상**: `develop`
    - **이름 규칙**: `bug/버그명` (예: `bug/token-expired`)
- **refactor**: 코드 리팩토링(기능 변경 없는 구조 개선) 시 사용합니다.
    - **분기점**: `develop`
    - **병합 대상**: `develop`
    - **이름 규칙**: `refactor/개선대상` (예: `refactor/db-query`)