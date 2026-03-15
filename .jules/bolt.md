
## 2024-05-17 - Redundant database queries in redirect/render flows
**Learning:** Found O(N) performance bottlenecks in `routes/refController.js` and `routes/bbsController.js` (`/insert` routes) where `count()` and `findAll()` queries were blindly executing database lookups immediately before a `res.redirect()` or `res.render()`, discarding all data.
**Action:** Always verify if database queries preceding HTTP redirects or generic template renders are actually consumed; if not, remove them to eliminate unnecessary I/O overhead.

## 2024-05-17 - findAndCountAll overhead when total is unused
**Learning:** In routes like `/getContent` (`routes/refController.js`, `routes/bbsController.js`), `Model.findAndCountAll()` executes an expensive, supplementary `SELECT COUNT(*)` query.
**Action:** When a client response only utilizes the `rows` array (and not the total `count`), exclusively use `Model.findAll()` to prevent database performance waste.
