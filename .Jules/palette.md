## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-02-21 - Admin Write Form Interaction
**Learning:** Legacy admin forms (e.g., `contact1_write.html`) use `<a>` tags for actions and lack loading states, creating accessibility barriers and potential data integrity issues (double submission).
**Action:** Replaced action links with `<button type='button'>` and implemented loading states. This pattern should be applied to all similar administrative forms for consistency.
