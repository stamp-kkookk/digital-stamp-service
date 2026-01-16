# State & Data Fetching

## Use TanStack Query for server state

- `useQuery` for reads
- `useMutation` for writes
- Invalidate queries on mutation success

## Polling (MVP requirement)

Issuance approval status and terminal lists must support polling:
- Default: 2–3 seconds interval
- Stop when status is final or TTL expires

## Error UX

- Provide retry CTA
- Keep error messages short and clear
