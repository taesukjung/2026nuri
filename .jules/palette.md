## 2026-03-01 - Semantic Button and Loading State
**Learning:** Using `<a>` tags with `javascript:void()` for form submissions breaks keyboard accessibility and lacks native disabled states, which can cause duplicate submissions on slow connections.
**Action:** Replace anchor tags with semantic `<button type="button">`, applying existing styles and implementing disabled loading states (text change + `disabled=true`) during synchronous form submissions.
