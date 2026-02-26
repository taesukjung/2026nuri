## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-02-12 - News Room Editor Form UX
**Learning:** The news room editor (`views/contact/contact1_write.html`) relied on link-based actions (`javascript:save()`) for form submission, making it inaccessible and prone to double-submission. The `.btn_area` CSS class was restrictively scoped to `a` tags.
**Action:** Updated `.btn_area` CSS to support `<button>` elements. Replaced links with semantic `<button type="button">` and implemented immediate disabling on click to provide visual feedback ("Saving...") and prevent duplicate submissions.
