
## 2026-02-28 - [Remove redundant table fetch and counts]
**Learning:** In the refController and bbsController '/insert' routes, the entire table was fetched using 'findAll' and 'count' immediately before a redirect, effectively discarding the data and causing an O(N) performance bottleneck. Also, in '/getContent' routes, 'findAndCountAll' was used when the count result was entirely unused by the client, executing an unnecessary 'SELECT COUNT(*)' query.
**Action:** Replaced the redundant 'findAll' and 'count' in '/insert' routes with a direct 'res.redirect'/'res.render'. Replaced 'findAndCountAll' with 'findAll' in '/getContent' routes. Added regression tests to ensure these operations are not reintroduced.
