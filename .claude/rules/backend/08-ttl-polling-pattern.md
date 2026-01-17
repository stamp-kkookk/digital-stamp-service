# backend/06-security.md 수정

## Step-up Authentication (OTP)

### Gated Actions (Mandatory OTP)
- **Redeem** (사용하기): MUST verify OTP session before creating RedeemSession
- (Optional) Profile edit, account recovery

### Implementation:
- Service layer checks: `OtpSession.isValid()` before critical action
- Session TTL: ~10 min
- Return 403 with `"OTP_REQUIRED"` error code if not verified

### Anti-pattern:
- ❌ Never trust client-side "otpVerified" flag
- ❌ Always validate server-side session
