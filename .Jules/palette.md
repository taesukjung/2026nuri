## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-03-05 - Semantic Buttons & Loading States
**Learning:** Legacy views in this app (e.g., `views/archive/casestudy-write.html`) heavily use the `javascript:save()` pattern on `<a>` tags for form submission, which lacks keyboard accessibility (Space/Enter to submit) and visual feedback. Furthermore, the CSS `public/css/sub.css` was heavily coupled to `<a>` tags for `.btn_area`.
**Action:** When replacing `<a>` with `<button>` in `.btn_area`, explicitly add `.btn_area button` and `.btn_area button:disabled` to the CSS to maintain visual consistency and provide clear loading state feedback without altering the overall design system.
