## 2024-03-03 - Redundant findAndCountAll
**Learning:** In the Sequelize backend, `Model.findAndCountAll()` executes an expensive `SELECT COUNT(*)` query. Developers frequently use it out of habit even in routes (like `/getContent`) where the total count is ignored and only the resulting rows are used in the JSON response.
**Action:** Always replace `Model.findAndCountAll()` with `Model.findAll()` when the `count` property of the result is not accessed or utilized in the route logic or response payload. Ensure tests mock and verify method calls to prevent regressions.
