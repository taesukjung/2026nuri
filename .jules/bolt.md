## 2024-05-19 - Removed redundant DB queries
**Learning:** Found O(N) bottlenecks in `routes/refController.js` and `routes/bbsController.js` (`/insert` routes) where tables were redundantly queried (`findAll`, `count`) immediately before a response redirect or render, discarding the data.
**Action:** Removed redundant `count` and `findAll` operations before redirect and optimized `findAndCountAll` to `findAll` since count is ignored in `/getContent` endpoints.
