## 2025-02-18 - Redundant Query Before Redirect
**Learning:** Found a pattern where `findAll` (fetching the entire table!) was called immediately before `res.redirect`, meaning the data was discarded and the response delayed unnecessarily.
**Action:** Always check `res.redirect` or `res.send` calls to see if preceding database queries are actually used.
