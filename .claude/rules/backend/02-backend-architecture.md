# Architecture

## Package strategy

Prefer feature packages:

```
com.yourteam.kkoookk
  global/
    config/
    security/
    exception/
    response/
    util/
  controller/
    owner/
    store/
    stampcard/
    wallet/
    issuance/
    redeem/
    migration/
  service/
    owner/
    store/
    stampcard/
    wallet/
    issuance/
    redeem/
    migration/
  repository/
    owner/
    store/
    stampcard/
    wallet/
    issuance/
    redeem/
    migration/
  domain/
    owner/
    store/
    stampcard/
    wallet/
    issuance/
    redeem/
    migration/
```

## Layer responsibility

- Controller: HTTP + DTO mapping + validation
- Service: business logic + transactions
- Repository: persistence & queries

Keep controllers thin and logic inside services.
