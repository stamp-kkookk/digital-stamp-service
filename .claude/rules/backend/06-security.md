# Security (MVP)

## Customer

- Phone + name lookup is brute-force risky → add rate limits & cooldown.
- Redeem action requires **OTP step-up**.

## Owner / Terminal

- Owner-only endpoints must be protected.
- Terminal shares owner session in MVP (OK), but log all actions.

## Audit log

- Log issuance/redeem/migration events with:
  - walletId, storeId, stampCardId, timestamp, result
