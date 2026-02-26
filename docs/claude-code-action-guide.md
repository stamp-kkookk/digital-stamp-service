# Claude Code Action 도입 가이드

> KKOOKK 프로젝트에 Claude Code Action을 도입하여 AI 코드 리뷰를 자동화한다.
> CodeRabbit을 대체하며, Claude Pro 구독 한도 내에서 추가 비용 없이 운영한다.

## 1. 왜 도입하는가?

| 기존 (CodeRabbit) | 변경 (Claude Code Action) |
|---|---|
| 별도 SaaS (계정/설정 분리) | GitHub Actions 네이티브 |
| 프로젝트 컨텍스트 모름 | CLAUDE.md 읽어서 컨벤션 반영 |
| 리뷰 코멘트만 가능 | 코드 직접 수정 + 커밋 가능 |
| 유료 플랜 필요 (Pro $24/인/월) | Claude Pro 구독 내 무료 |
| CI 린터와 기능 중복 | CI와 역할 분리 (리뷰 vs 린트) |

## 2. 사전 준비

### 2-1. OAuth 토큰 발급

```bash
claude setup-token
```

- Claude Pro/Max 구독자만 가능
- API 키가 아닌 **구독 인증 토큰** → 플랜 한도 내 무료
- 토큰 만료 시 동일 명령어로 재발급

### 2-2. GitHub Secrets 등록

Repository → Settings → Secrets and variables → Actions → New repository secret

| Secret 이름 | 값 |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | `claude setup-token`으로 발급받은 토큰 |

### 2-3. Claude GitHub App 설치

1. https://github.com/apps/claude 방문
2. `stamp-kkookk` Organization에 설치
3. `digital-stamp-service` 리포지토리 선택

## 3. Workflow 파일

### `.github/workflows/claude.yml`

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, reopened, synchronize]
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  claude-review:
    concurrency:
      group: claude-review-${{ github.event.pull_request.number || github.event.issue.number }}
      cancel-in-progress: true
    if: |
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude') &&
        github.event.issue.pull_request != null &&
        contains(fromJSON('["OWNER","MEMBER","COLLABORATOR"]'), github.event.comment.author_association)) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude') &&
        contains(fromJSON('["OWNER","MEMBER","COLLABORATOR"]'), github.event.comment.author_association))
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      # 전략 1: 이전 봇 리뷰 스마트 클린업
      # - PR에 커밋 추가(synchronize) 시에만 동작
      # - Resolved 스레드: 보존 (수정 완료된 유의미한 기록)
      # - 사람 답글이 있는 스레드: 보존 (진행 중인 토론)
      # - 봇만 단독으로 남긴 미해결 코멘트: 삭제 (노이즈)
      - name: Delete Previous Claude Reviews
        if: github.event.action == 'synchronize'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          REPO: ${{ github.repository }}
        run: |
          set +e
          echo "이전 Claude 리뷰 검색 중..."

          # 1. PR 코멘트(요약) 삭제 - Claude 코멘트만 필터링
          gh api "repos/$REPO/issues/$PR_NUMBER/comments" --paginate \
            --jq '.[] | select(.user.login == "github-actions[bot]") | select(.body | test("Claude")) | .id' \
            | while read comment_id; do
                if [ -n "$comment_id" ]; then
                  echo "PR 코멘트 삭제: $comment_id"
                  gh api -X DELETE "repos/$REPO/issues/comments/$comment_id" 2>/dev/null || true
                  sleep 0.3
                fi
              done

          # 2. 인라인 리뷰 코멘트 삭제
          # - 미해결(Unresolved) + 봇만 있는 스레드만 삭제
          # - 사용자 답글이 있는 스레드는 보존
          OWNER=${REPO%/*}
          NAME=${REPO#*/}
          gh api graphql -F owner="$OWNER" -F name="$NAME" -F number=$PR_NUMBER -f query='
            query($owner: String!, $name: String!, $number: Int!) {
              repository(owner: $owner, name: $name) {
                pullRequest(number: $number) {
                  reviewThreads(last: 100) {
                    nodes {
                      isResolved
                      comments(first: 50) {
                        nodes {
                          databaseId
                          author { login }
                        }
                      }
                    }
                  }
                }
              }
            }' \
            --jq '.data.repository.pullRequest.reviewThreads.nodes[]
              | select(.isResolved == false)
              | select((.comments.nodes | length) > 0)
              | select([.comments.nodes[].author.login] | all(. == "github-actions[bot]"))
              | .comments.nodes[].databaseId' \
            | while read comment_id; do
                if [ -n "$comment_id" ]; then
                  echo "인라인 코멘트 삭제: $comment_id"
                  gh api -X DELETE "repos/$REPO/pulls/comments/$comment_id" 2>/dev/null || true
                  sleep 0.3
                fi
              done

          echo "이전 리뷰 삭제 완료"

      # 자동 리뷰 (PR events) - 읽기 + 코멘트만
      - name: Run Claude Code Review
        if: github.event_name == 'pull_request'
        uses: anthropics/claude-code-action@v1
        with:
          show_full_output: true
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          prompt: |
            REPO: ${{ github.repository }}
            PR NUMBER: ${{ github.event.pull_request.number }}
            이 PR을 리뷰하고 코멘트로 작성해주세요.
          claude_args: '--allowedTools "Read,Bash(gh pr diff:*),Bash(gh pr view:*),mcp__github_inline_comment__create_inline_comment"'

      # 대화형 (@claude mentions) - 코드 수정 가능
      - name: Run Claude Interactive
        if: github.event_name != 'pull_request'
        uses: anthropics/claude-code-action@v1
        with:
          show_full_output: true
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          prompt: |
            REPO: ${{ github.repository }}
            PR NUMBER: ${{ github.event.pull_request.number || github.event.issue.number }}
            이 PR을 리뷰하고 코멘트로 작성해주세요.
          claude_args: '--allowedTools "Edit,Read,Write,Bash(git add:*),Bash(git commit:*),Bash(git push:*),Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),mcp__github_inline_comment__create_inline_comment"'
          trigger_phrase: "@claude"
```

## 4. 핵심 전략

### 전략 1: 스마트 클린업 — 사람의 대화는 보존, 봇의 노이즈만 제거

PR에 커밋을 추가할 때마다 이전 리뷰와 새 리뷰가 뒤섞이는 문제를 해결한다.

```text
커밋 추가 (synchronize)
    ↓
GraphQL로 리뷰 스레드 조회
    ↓
┌─ Resolved 스레드         → 보존 (수정 완료 기록)
├─ 사람 답글 있는 스레드    → 보존 (진행 중인 토론)
└─ 봇만 단독 미해결 코멘트  → 삭제 (노이즈)
    ↓
새로운 리뷰 생성
```

### 전략 2: Minimalist Prompting — 최고의 프롬프트는 가장 짧은 프롬프트

```yaml
# 이렇게 길게 쓰지 않는다
prompt: |
  1. 버그 및 로직 오류를 검토하세요
  2. 보안 취약점을 확인하세요
  3. 성능 문제를 지적하세요
  4. 한국어로 작성하세요
  5. 심각도를 표시하세요
  ...

# 이렇게 짧게 쓴다
prompt: |
  이 PR을 리뷰하고 코멘트로 작성해주세요.
```

**왜 짧은 프롬프트가 더 좋은가:**
- 프롬프트가 길면 핵심 지시(Signal)가 부가 규칙(Noise)에 묻힘
- 구체적 예시를 강제하면 모델의 추론 능력을 제한
- CLAUDE.md가 이미 프로젝트 컨텍스트를 제공하므로 프롬프트에서 중복 불필요
- 반복적으로 발생하는 문제만 점진적으로 프롬프트에 추가

### 동작 흐름

```text
PR 생성 (opened)
    ↓
Claude가 CLAUDE.md + diff 분석 → 인라인 리뷰 작성

PR 업데이트 (synchronize)
    ↓
이전 봇 리뷰 스마트 삭제 → Claude가 새로 리뷰

@claude 멘션
    ↓
질문 응답 / 코드 수정 / 테스트 생성
```

## 5. 기존 CI와의 역할 분리

```text
PR 생성/업데이트
    ├── Backend CI (기존 유지)
    │   ├── Gradle 빌드
    │   ├── JUnit5 테스트
    │   ├── Jacoco 커버리지 (≥60% / ≥50%)
    │   ├── Spotless 포맷 체크
    │   └── Checkstyle 컨벤션 체크
    │
    └── Claude Code Review (신규)
        ├── 로직/버그 리뷰
        ├── 보안 취약점 검토
        ├── 성능 이슈 지적
        └── 아키텍처 준수 확인
```

- **CI**: 자동화 가능한 규칙 기반 검사 → **머지 차단**
- **Claude**: 사람이 봐야 할 맥락 기반 리뷰 → **코멘트 제안**

## 6. CodeRabbit 제거

Claude Code Action 도입 후 CodeRabbit을 제거한다.

1. CodeRabbit GitHub App 제거
   - Organization Settings → Installed GitHub Apps → CodeRabbit → Uninstall
2. `.coderabbit.yaml` 설정 파일이 있다면 삭제
3. 관련 문서 업데이트

## 7. 주의사항

### 토큰 만료
- OAuth 토큰은 일정 기간 후 만료될 수 있음
- 만료 시 `claude setup-token`으로 재발급 후 GitHub Secret 업데이트
- 리뷰가 갑자기 안 달리면 토큰 만료를 먼저 확인

### 사용량 한도
- Claude Pro 플랜의 사용량 한도 내에서 동작
- PR이 많은 날 한도에 도달할 수 있음
- 한도 초과 시 리뷰가 실패하며, 다음 리셋까지 대기

### 프롬프트 튜닝 (Minimalist 원칙)
- 프롬프트는 최소한으로 유지 → 모델의 추론 능력에 위임
- 리뷰 품질 개선은 프롬프트가 아니라 **CLAUDE.md에 규칙 추가**로 해결
- 반복적으로 발생하는 특정 이슈만 점진적으로 프롬프트에 추가

## 8. 활용 예시

### PR에서 코드 수정 요청
```text
@claude 이 서비스 메서드에 트랜잭션 처리가 빠져 있는 것 같아. 수정해줘.
```

### 테스트 코드 생성 요청
```text
@claude 이 PR에서 변경된 서비스 메서드에 대한 단위 테스트를 작성해줘.
@MockitoBean을 사용하고, 프로젝트 테스트 패턴을 따라줘.
```

### 리뷰 재요청
```text
@claude 수정한 부분 다시 리뷰해줘.
```


