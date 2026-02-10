# Feature: Statistics (통계)

> Owner 백오피스에서 매장별 적립/리워드 통계를 조회하는 기능.
> StampEvent, RedeemEvent, WalletReward 데이터를 기간별로 집계한다.

## Status: Implemented

---

## 1. Overview

통계 기능은 Owner가 특정 매장의 성과를 파악하기 위한 대시보드 데이터를 제공한다.
단일 엔드포인트에서 기간(startDate ~ endDate)을 기준으로 5가지 핵심 메트릭과
일별 적립 추이(dailyTrend)를 반환한다.

**핵심 메트릭:**
1. `totalStamps` -- 기간 내 총 적립 스탬프 수
2. `totalRewardsIssued` -- 기간 내 총 발급된 리워드 수
3. `totalRewardsRedeemed` -- 기간 내 총 사용된 리워드 수
4. `activeUsers` -- 기간 내 적립 활동이 있는 고유 고객 수
5. `dailyTrend[]` -- 일별 적립 수 추이 (sparse: 데이터 있는 날짜만)

---

## 2. Backend Architecture

### 2.1 Package Structure

```
com.project.kkookk.statistics/
├── controller/
│   ├── OwnerStatisticsApi.java         # Swagger interface
│   └── OwnerStatisticsController.java  # REST controller
├── dto/
│   └── StoreStatisticsResponse.java    # Response DTO (+ nested DailyStampCount)
└── service/
    └── OwnerStatisticsService.java     # Aggregation business logic
```

### 2.2 Related Domain Entities

통계 서비스는 자체 엔티티를 소유하지 않으며, 다른 도메인의 이벤트 데이터를 읽기 전용으로 집계한다.

#### StampEvent (com.project.kkookk.stamp.domain)

| Column | Type | Description |
|--------|------|-------------|
| id | Long (PK) | 식별자 |
| store_id | Long | 매장 ID |
| stamp_card_id | Long | 스탬프 카드 ID |
| wallet_stamp_card_id | Long | 고객별 스탬프 카드 ID |
| type | StampEventType | ISSUED, MIGRATED, MANUAL_ADJUST |
| delta | Integer | 스탬프 수 변동 (양수: 적립, 음수: 차감) |
| reason | String | 사유 |
| occurred_at | DATETIME(6) | 발생 시각 |
| issuance_request_id | Long | 연관 적립 요청 ID (nullable) |
| stamp_migration_request_id | Long | 연관 마이그레이션 요청 ID (nullable) |

#### RedeemEvent (com.project.kkookk.redeem.domain)

| Column | Type | Description |
|--------|------|-------------|
| id | Long (PK) | 식별자 |
| redeem_session_id | Long | 리딤 세션 ID |
| wallet_id | Long | 고객 지갑 ID |
| store_id | Long | 매장 ID |
| type | RedeemEventType | 리딤 이벤트 타입 |
| result | RedeemEventResult | SUCCESS, FAILED, EXPIRED 등 |
| occurred_at | DATETIME(6) | 발생 시각 |

#### WalletReward (com.project.kkookk.wallet.domain)

리워드 발급 기록으로, `issuedAt`을 기준으로 기간 내 발급 수를 집계한다.

---

## 3. API Endpoints

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| GET | `/api/owner/stores/{storeId}/statistics` | OWNER | 200 | 매장 통계 조회 |

### 3.1 Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| startDate | LocalDate (ISO) | No | endDate - 30 days | 조회 시작일 |
| endDate | LocalDate (ISO) | No | LocalDate.now() | 조회 종료일 |

### 3.2 Example Request

```
GET /api/owner/stores/42/statistics?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <OWNER_JWT>
```

---

## 4. Sequence Diagram

### 4.1 Get Store Statistics

```
Owner Browser       StatisticsController    OwnerStatisticsService    StoreRepo  StampEventRepo  RedeemEventRepo  WalletRewardRepo
     |                     |                        |                    |            |                |               |
     |--GET /statistics--->|                        |                    |            |                |               |
     |  ?startDate&endDate |                        |                    |            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |--[Default dates]       |                    |            |                |               |
     |                     |  end = endDate ?? now  |                    |            |                |               |
     |                     |  start = startDate     |                    |            |                |               |
     |                     |          ?? end - 30d  |                    |            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |--getStoreStatistics--->|                    |            |                |               |
     |                     |  (storeId, ownerId,    |                    |            |                |               |
     |                     |   start, end)          |                    |            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |           [Step 1: 매장 존재 + 소유권 검증]   |            |                |               |
     |                     |                        |--findById--------->|            |                |               |
     |                     |                        |<--Store------------|            |                |               |
     |                     |                        |--ownerAccountId    |            |                |               |
     |                     |                        |  == ownerId?       |            |                |               |
     |                     |                        | [no] throw         |            |                |               |
     |                     |                        |  ACCESS_DENIED     |            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |           [Step 2: 기간 변환]                |            |                |               |
     |                     |                        |--startDate         |            |                |               |
     |                     |                        |  .atStartOfDay()   |            |                |               |
     |                     |                        |--endDate           |            |                |               |
     |                     |                        |  .atTime(MAX)      |            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |           [Step 3: totalStamps]             |            |                |               |
     |                     |                        |--sumPositiveDelta->|            |                |               |
     |                     |                        |  ByStoreIdAndPeriod|----------->|                |               |
     |                     |                        |<--long totalStamps-|            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |           [Step 4: totalRewardsIssued]       |            |                |               |
     |                     |                        |--countByStoreIdAnd>|            |                |               |
     |                     |                        |  IssuedAtBetween   |            |                |-------------->|
     |                     |                        |<--long issued------|            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |           [Step 5: totalRewardsRedeemed]     |            |                |               |
     |                     |                        |--countByStoreIdAnd>|            |                |               |
     |                     |                        |  PeriodAndResult   |----------->|--------------->|               |
     |                     |                        |  (result=SUCCESS)  |            |                |               |
     |                     |                        |<--long redeemed----|            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |           [Step 6: activeUsers]             |            |                |               |
     |                     |                        |--countDistinct---->|            |                |               |
     |                     |                        |  WalletsByStoreId  |----------->|                |               |
     |                     |                        |  AndPeriod         |            |                |               |
     |                     |                        |<--long users-------|            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |           [Step 7: dailyTrend]              |            |                |               |
     |                     |                        |--findDailyStamp--->|            |                |               |
     |                     |                        |  CountsByStoreId   |----------->|                |               |
     |                     |                        |  AndPeriod         |            |                |               |
     |                     |                        |<--List<Object[]>---|            |                |               |
     |                     |                        |  [{date, count}]   |            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |                        |--map to            |            |                |               |
     |                     |                        |  DailyStampCount[] |            |                |               |
     |                     |                        |                    |            |                |               |
     |                     |<--StoreStatistics------|                    |            |                |               |
     |                     |   Response             |                    |            |                |               |
     |<--200 + body--------|                        |                    |            |                |               |
```

---

## 5. DTO Field Specifications

### 5.1 StoreStatisticsResponse

| Field | Type | Nullable | Description | Example |
|-------|------|----------|-------------|---------|
| startDate | LocalDate | No | 조회 기간 시작일 | "2026-01-01" |
| endDate | LocalDate | No | 조회 기간 종료일 | "2026-01-31" |
| totalStamps | long | No | 기간 내 총 적립 스탬프 수 (양수 delta 합산) | 1234 |
| totalRewardsIssued | long | No | 기간 내 총 발급된 리워드 수 | 50 |
| totalRewardsRedeemed | long | No | 기간 내 총 사용된 리워드 수 (result=SUCCESS) | 30 |
| activeUsers | long | No | 기간 내 적립 활동 고유 고객 수 (DISTINCT wallet) | 120 |
| dailyTrend | List\<DailyStampCount\> | No | 일별 적립 추이 (sparse) | [...] |

### 5.2 DailyStampCount (Nested Record)

| Field | Type | Nullable | Description | Example |
|-------|------|----------|-------------|---------|
| date | LocalDate | No | 날짜 | "2026-01-15" |
| count | long | No | 해당 일자 적립 수 | 45 |

---

## 6. Aggregation Query Details

### 6.1 totalStamps

```sql
-- StampEventRepository.sumPositiveDeltaByStoreIdAndPeriod()
SELECT COALESCE(SUM(se.delta), 0)
FROM stamp_event se
WHERE se.store_id = :storeId
  AND se.delta > 0
  AND se.occurred_at BETWEEN :startDateTime AND :endDateTime
```

**Logic**: Sum only positive deltas (stamp issuances), excluding negative adjustments.

### 6.2 totalRewardsIssued

```sql
-- WalletRewardRepository.countByStoreIdAndIssuedAtBetween()
SELECT COUNT(*)
FROM wallet_reward wr
WHERE wr.store_id = :storeId
  AND wr.issued_at BETWEEN :startDateTime AND :endDateTime
```

**Logic**: Count all rewards issued to customers in the period.

### 6.3 totalRewardsRedeemed

```sql
-- RedeemEventRepository.countByStoreIdAndPeriodAndResult()
SELECT COUNT(*)
FROM redeem_event re
WHERE re.store_id = :storeId
  AND re.occurred_at BETWEEN :startDateTime AND :endDateTime
  AND re.result = 'SUCCESS'
```

**Logic**: Count only successful redemptions (result=SUCCESS), excluding failed/expired.

### 6.4 activeUsers

```sql
-- StampEventRepository.countDistinctWalletsByStoreIdAndPeriod()
SELECT COUNT(DISTINCT wsc.wallet_id)
FROM stamp_event se
JOIN wallet_stamp_card wsc ON se.wallet_stamp_card_id = wsc.id
WHERE se.store_id = :storeId
  AND se.occurred_at BETWEEN :startDateTime AND :endDateTime
```

**Logic**: Count unique customers (wallets) who had stamp activity in the period.

### 6.5 dailyTrend

```sql
-- StampEventRepository.findDailyStampCountsByStoreIdAndPeriod()
SELECT DATE(se.occurred_at) AS day, SUM(se.delta) AS total
FROM stamp_event se
WHERE se.store_id = :storeId
  AND se.delta > 0
  AND se.occurred_at BETWEEN :startDateTime AND :endDateTime
GROUP BY DATE(se.occurred_at)
ORDER BY day ASC
```

**Logic**: Returns only days with non-zero stamp activity (**sparse** -- no zero-fill for empty days). The frontend is responsible for filling in missing dates when rendering charts.

### 6.6 Date Handling in dailyTrend

The service handles multiple date types from the raw query result:

```java
if (row[0] instanceof java.sql.Date sqlDate) {
    date = sqlDate.toLocalDate();
} else if (row[0] instanceof LocalDate localDate) {
    date = localDate;
} else {
    date = LocalDate.parse(row[0].toString());
}
```

This defensive handling accommodates different JPA/Hibernate/JDBC driver return types.

---

## 7. State Transitions

Statistics itself has no state machine. It is a read-only aggregation over event data:

```
StampEvent (ISSUED/MIGRATED/MANUAL_ADJUST)
     |
     +--[delta > 0]--> counted in totalStamps + dailyTrend
     +--[delta <= 0]--> excluded from totalStamps

RedeemEvent
     |
     +--[result = SUCCESS]--> counted in totalRewardsRedeemed
     +--[result != SUCCESS]--> excluded

WalletReward
     |
     +--[issuedAt in range]--> counted in totalRewardsIssued
```

---

## 8. Error Codes

| ErrorCode | HTTP Status | Code String | Korean Message | Trigger |
|-----------|-------------|-------------|----------------|---------|
| STORE_NOT_FOUND | 404 | STORE_NOT_FOUND | 매장을 찾을 수 없습니다 | storeId does not exist |
| ACCESS_DENIED | 403 | ACCESS_DENIED | 접근 권한이 없습니다 | Authenticated owner does not own the store |
| UNAUTHORIZED | 401 | UNAUTHORIZED | 인증이 필요합니다 | No OWNER token provided |

### 8.1 Ownership Verification Difference

Unlike `StoreService` which uses `findByIdAndOwnerAccountId()` (returns 404 for non-owned stores),
`OwnerStatisticsService` uses `findById()` + explicit ownership check:

```java
Store store = storeRepository.findById(storeId)
        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

if (!store.getOwnerAccountId().equals(ownerId)) {
    throw new BusinessException(ErrorCode.ACCESS_DENIED);  // 403, not 404
}
```

This means **statistics explicitly reveals that a store exists** to non-owners (403 vs 404).
This is a minor security inconsistency compared to the store CRUD API's 404 approach.

---

## 9. Edge Cases

### 9.1 No Data Returns Zeros (Not Empty)

- **Scenario**: Query period has no stamp events, no rewards, no redemptions.
- **Behavior**: All numeric fields return `0`. `dailyTrend` returns an empty list `[]`.
- **Frontend**: Should display "0" values and an empty chart, not error state.

```json
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "totalStamps": 0,
  "totalRewardsIssued": 0,
  "totalRewardsRedeemed": 0,
  "activeUsers": 0,
  "dailyTrend": []
}
```

### 9.2 Large Date Ranges

- **Scenario**: Owner queries 1 year of data (365+ days).
- **Behavior**: All 5 queries execute against the full range. Performance degrades linearly with data volume.
- **Mitigation**: No server-side limit currently imposed. For large datasets, consider:
  - Adding a max range validation (e.g., 90 days)
  - Caching aggregated results
  - Pre-computing daily aggregates

### 9.3 Future Dates

- **Scenario**: Owner passes `endDate` in the future.
- **Behavior**: Query runs normally but returns no data for future dates (no events exist yet). This is acceptable behavior.

### 9.4 Start Date After End Date

- **Scenario**: `startDate=2026-02-01&endDate=2026-01-01`.
- **Behavior**: Queries execute with inverted range; `BETWEEN` will match nothing. Returns all zeros. No validation error is thrown.
- **Recommendation**: Add server-side validation to reject inverted date ranges.

### 9.5 Sparse Daily Trend

- **Scenario**: Only 3 out of 30 days have stamp activity.
- **Behavior**: `dailyTrend` contains exactly 3 entries. The other 27 days are **not included**.
- **Frontend Responsibility**: When rendering a line/bar chart, the frontend must:
  1. Generate the full date range (startDate to endDate)
  2. Left-join with the sparse dailyTrend data
  3. Fill missing dates with `count: 0`

### 9.6 Ownership Leaks Store Existence (403 vs 404)

- **Scenario**: Owner A requests statistics for Owner B's store.
- **Behavior**: Returns `403 ACCESS_DENIED` instead of `404`.
- **Impact**: Owner A can infer that the store exists. This differs from the store CRUD API which consistently returns 404.
- **Recommendation**: Align with the store CRUD pattern by using `findByIdAndOwnerAccountId()`.

### 9.7 Concurrent Data Writes During Query

- **Scenario**: New stamp events are being written while statistics query executes.
- **Behavior**: `@Transactional(readOnly = true)` uses a consistent snapshot. The exact snapshot behavior depends on the MySQL transaction isolation level (default: REPEATABLE READ).

---

## 10. Frontend Integration

### 10.1 TanStack Query Keys

```typescript
// Statistics
QUERY_KEYS.storeStatistics = (storeId: number, startDate?: string, endDate?: string) =>
  ['owner', 'store', storeId, 'statistics', { startDate, endDate }] as const

// Related event lists
QUERY_KEYS.storeStampEvents = (storeId: number) =>
  ['owner', 'store', storeId, 'stampEvents'] as const

QUERY_KEYS.storeRedeemEvents = (storeId: number) =>
  ['owner', 'store', storeId, 'redeemEvents'] as const
```

### 10.2 API Endpoints (Frontend)

```typescript
API_ENDPOINTS.OWNER.STORE_STATISTICS = (storeId: number) =>
  `/api/owner/stores/${storeId}/statistics`

API_ENDPOINTS.OWNER.STORE_STAMP_EVENTS = (storeId: number) =>
  `/api/owner/stores/${storeId}/stamp-events`

API_ENDPOINTS.OWNER.STORE_REDEEM_EVENTS = (storeId: number) =>
  `/api/owner/stores/${storeId}/redeem-events`
```

### 10.3 Frontend Query Hook (Expected Pattern)

```typescript
export function useStoreStatistics(
  storeId: number,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: QUERY_KEYS.storeStatistics(storeId, startDate, endDate),
    queryFn: () => getStoreStatistics(storeId, { startDate, endDate }),
    enabled: !!storeId,
  });
}
```

### 10.4 Chart Visualization

- **Library**: recharts (React charting library)
- **Chart Types**:
  - **Summary Cards**: totalStamps, totalRewardsIssued, totalRewardsRedeemed, activeUsers displayed as KPI cards
  - **Line/Bar Chart**: dailyTrend rendered as time-series chart
  - **Date Range Picker**: startDate/endDate selection with sensible presets (7d, 30d, 90d)

### 10.5 Sparse Data Fill Strategy (Frontend)

```typescript
function fillDailyTrend(
  dailyTrend: DailyStampCount[],
  startDate: string,
  endDate: string
): DailyStampCount[] {
  const trendMap = new Map(dailyTrend.map(d => [d.date, d.count]));
  const result: DailyStampCount[] = [];

  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: trendMap.get(dateStr) ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}
```

### 10.6 Cache Invalidation Strategy

| Event | Action |
|-------|--------|
| New stamp event (issuance approved) | Invalidate `storeStatistics(storeId, *)` and `storeStampEvents(storeId)` |
| New redeem event (session completed) | Invalidate `storeStatistics(storeId, *)` and `storeRedeemEvents(storeId)` |
| Date range change in UI | New query with different key (automatic by TanStack Query) |

> **Note**: Statistics are not invalidated on every mutation in the current implementation.
> The frontend relies on manual refetch or stale-while-revalidate patterns.

---

## 11. Related Features

| Feature | Relationship | Data Source |
|---------|-------------|-------------|
| **Issuance** | Approved issuance creates StampEvent (type=ISSUED, delta=+1) | `stamp_event` table |
| **Migration** | Approved migration creates StampEvent (type=MIGRATED, delta=+N) | `stamp_event` table |
| **Redeem** | Completed redemption creates RedeemEvent (result=SUCCESS) | `redeem_event` table |
| **Wallet Reward** | When stamps reach goal, WalletReward is auto-issued | `wallet_reward` table |
| **Store** | Statistics are per-store, ownership verified via Store entity | `store` table |
| **StampCard** | StampEvents reference stamp_card_id, but statistics aggregate across all cards | indirect |

---

## 12. Related Event Endpoints (Paginated Detail)

While the statistics endpoint provides **aggregated** data, two additional endpoints provide
**paginated event-level detail** for drill-down:

### 12.1 Stamp Events

```
GET /api/owner/stores/{storeId}/stamp-events
Authorization: Bearer <OWNER_JWT>
```

Returns paginated list of individual StampEvent records for the store.

### 12.2 Redeem Events

```
GET /api/owner/stores/{storeId}/redeem-events
Authorization: Bearer <OWNER_JWT>
```

Returns paginated list of individual RedeemEvent records for the store.

These endpoints are referenced in the frontend:

```typescript
API_ENDPOINTS.OWNER.STORE_STAMP_EVENTS  = (storeId) => `/api/owner/stores/${storeId}/stamp-events`
API_ENDPOINTS.OWNER.STORE_REDEEM_EVENTS = (storeId) => `/api/owner/stores/${storeId}/redeem-events`
```

---

## 13. Example Response

### 13.1 Normal Data

```json
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "totalStamps": 1234,
  "totalRewardsIssued": 50,
  "totalRewardsRedeemed": 30,
  "activeUsers": 120,
  "dailyTrend": [
    { "date": "2026-01-02", "count": 15 },
    { "date": "2026-01-03", "count": 22 },
    { "date": "2026-01-05", "count": 8 },
    { "date": "2026-01-06", "count": 31 },
    { "date": "2026-01-10", "count": 45 },
    { "date": "2026-01-15", "count": 67 }
  ]
}
```

> Note: Jan 1, 4, 7-9, 11-14, 16-31 are absent (sparse). Frontend fills with 0.

### 13.2 Empty Period

```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "totalStamps": 0,
  "totalRewardsIssued": 0,
  "totalRewardsRedeemed": 0,
  "activeUsers": 0,
  "dailyTrend": []
}
```
