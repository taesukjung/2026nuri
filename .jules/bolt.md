## 2023-10-27 - O(N) Fetch on Insert
**Learning:** Found a pattern where `/insert` routes perform `findAll` (fetching the entire table) immediately after insertion, presumably for debugging or legacy reasons, but discard the result. This causes massive slowdowns as table size grows.
**Action:** Check all `insert` routes for redundant `findAll` calls and remove them.
