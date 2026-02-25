## 2024-02-14 - Redundant Queries on Redirect
**Learning:** Found a critical anti-pattern where an entire table was fetched (`findAll`) immediately before a `res.redirect`, which discarded the data. This turned an O(1) insert into an O(N) memory hog.
**Action:** Always check `POST` handlers that redirect to see if they are performing unnecessary reads before the redirect.
