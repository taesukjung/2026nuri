## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-02-10 - Form Submission Button Accessibility
**Learning:** Multiple write/edit forms (e.g., `views/archive/casestudy-write.html`, `views/contact/contact1_write.html`) were using non-semantic `<a href="javascript:save()">` and `<a href="javascript:del()">` anchor tags for "Save" and "Delete" actions instead of native `<button>` elements. This breaks default keyboard accessibility (e.g., Spacebar interaction) and screen reader semantics.
**Action:** Replaced these specific anchor tags with `<button type="button" onclick="...">` elements and mapped their CSS classes (`.btn_area button`, `.btn_area button.line`) in `public/css/sub.css` and `public/css/sub_en.css` to match the exact visual styling of the previous anchor tags.
