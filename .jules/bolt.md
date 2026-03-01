## 2024-05-18 - [findAll over findAndCountAll for Unused Counts]
**Learning:** Using `Model.findAndCountAll()` executes two queries: one `SELECT` for rows and another `SELECT COUNT(*)` for the total row count. In routes where only the rows are returned and the count is discarded (like `/getContent` in `bbsController.js` and `refController.js`), this causes unnecessary database overhead.
**Action:** Always prefer `Model.findAll()` over `Model.findAndCountAll()` when the total count isn't actually utilized by the client to save a query.
