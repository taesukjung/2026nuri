## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-02-12 - Contact Write Form Accessibility
**Learning:** Legacy forms (`views/contact/contact1_write.html`) used `<a>` tags with `href="javascript:..."` for critical actions (Save/Delete), making them inaccessible and lacking feedback. Replacing them with `<button type="button">` required updating shared CSS (`public/css/sub.css`) to target `.btn_area button` alongside `.btn_area a` to maintain visual consistency without rewriting styles.
**Action:** When modernizing legacy buttons, extend existing CSS selectors (e.g., `selector a, selector button`) rather than duplicating styles or relying on `role="button"` on anchors, to get both native accessibility and consistent design.
