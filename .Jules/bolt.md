## 2026-02-24 - Redundant Full Table Scan in Insert Route
**Learning:** The `/ref/insert` route was performing a `findAll` (full table scan) and `count` immediately after creating a record, but the results were completely ignored before redirecting. This caused O(N) performance degradation on every insert as the table grew.
**Action:** Always check if the result of a database query is actually used. Remove queries that are not used in the response or logic flow.
