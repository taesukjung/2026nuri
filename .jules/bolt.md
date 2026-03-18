## 2024-03-18 - Avoid Redundant Queries Before Redirects
**Learning:** In controller actions that process state changes (like POST `/insert`), performing queries like `findAll` or `count` immediately before a `res.redirect()` or `res.render()` without passing that data to the view is an anti-pattern that wastes database cycles. This is a common pattern in this codebase.
**Action:** When inspecting state change handlers, check if data fetched is actually used. Remove redundant data fetching if the response simply redirects or renders a static page.
