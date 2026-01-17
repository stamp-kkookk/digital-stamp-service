## Irreversible Action Confirmation 

### Redeem Flow (MANDATORY)
Customer screen shows "사용 처리" button → Trigger 2-step modal:

**Modal content:**
- Title: "되돌릴 수 없는 작업입니다"
- Body: "매장 직원이 확인 후 눌러주세요"
- Buttons: [취소] (easy to hit) / [확인]

**TTL enforcement:**
- If modal not confirmed within 30-60s → auto-expire
- Show "요청이 만료되었습니다" → retry CTA

### Why This Matters:
- Prevents accidental customer-only redemption
- Forces store-side confirmation
- Abuse mitigation (no auto-click scripts)