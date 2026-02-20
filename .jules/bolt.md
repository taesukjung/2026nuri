## 2025-02-22 - [Redundant DB Queries in Controllers]
**Learning:** Some controller routes (like `refController.js` `/insert`) execute expensive queries (`findAll`, `count`) immediately after an insert but then ignore the results and redirect. This causes unnecessary DB load (O(N) operations on write).
**Action:** Always check `routes/*.js` for queries whose results are unused, especially before redirects.
