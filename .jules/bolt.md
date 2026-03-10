
## 2024-05-19 - Removed redundant count, findAll, and findAndCountAll queries in controllers
**Learning:** Found O(N) bottlenecks in routes/refController.js and routes/bbsController.js (`/insert` routes) where tables were redundantly queried (`findAll`, `count`) immediately before a response redirect or render, discarding the data. `findAndCountAll()` was also used in `/getContent` routes where only the rows were returned and pagination count was unused.
**Action:** Replaced `findAndCountAll` with `findAll` when the total count is not utilized by the client to avoid executing an additional, potentially expensive `SELECT COUNT(*)` query. Removed unused queries before redirects.
