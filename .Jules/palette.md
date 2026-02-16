## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2025-05-21 - Legacy Button Remediation
**Learning:** The application heavily relies on `<a>` tags with `href="javascript:..."` for actions, which breaks keyboard accessibility. CSS classes like `.btn_area a` are scoped only to anchors.
**Action:** When replacing legacy links with `<button>`, update the corresponding CSS selectors (e.g., `.btn_area a, .btn_area button`) to preserve visual design without duplicating styles or adding inline CSS.
