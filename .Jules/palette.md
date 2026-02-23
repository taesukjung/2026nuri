## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-02-10 - Legacy Button Upgrade Pattern
**Learning:** Many administrative forms use `<a>` tags with `href="javascript:save()"` inside `.btn_area` containers. These can be safely upgraded to `<button type="button">` by simply extending the existing `.btn_area a` CSS selector to include `.btn_area button`, preserving layout while gaining accessibility and state management (disabled/loading) capabilities.
**Action:** When refactoring legacy forms, apply this CSS pattern globally (`public/css/sub.css`) and update the HTML/JS to use semantic buttons with loading feedback.
