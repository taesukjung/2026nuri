## 2024-05-19 - Removed redundant queries in POST /insert
**Learning:** Found an O(N) performance bottleneck in backend controllers (`routes/refController.js` and `routes/bbsController.js`) where `findAll()` and `count()` queries were unnecessarily executed immediately before `res.redirect()` or `res.render()` without passing data.
**Action:** Removed these operations, directly passing execution to the redirection/rendering stage to eliminate unnecessary database load and network latency.
