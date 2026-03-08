## 2025-02-23 - Avoid redundant COUNT queries with findAll

**Learning:** When retrieving records where the total count is not utilized by the client (e.g., fetching a specific record's content in `/getContent` routes in `refController.js` and `bbsController.js`), using `findAndCountAll()` executes an unnecessary and potentially expensive `SELECT COUNT(*)` query.

**Action:** Prefer `findAll()` over `findAndCountAll()` when the total count property (`result.count`) is not needed by the client. Ensure that the callback logic handles the direct array return type (`result`) rather than attempting to access the nested `result.rows` property.
