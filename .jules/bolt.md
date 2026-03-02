## 2024-05-15 - [Database Query Optimization]
**Learning:** Using `Model.findAndCountAll()` when the result count is not used by the client generates an unnecessary `SELECT COUNT(*)` query, which can significantly impact performance for frequent requests. This is particularly noticeable in single-record fetches like `/getContent`.
**Action:** Always prefer `Model.findAll()` over `Model.findAndCountAll()` unless the count is explicitly required by the business logic or API response. Review existing queries to identify and remove unnecessary count operations.
