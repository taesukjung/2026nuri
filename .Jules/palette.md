## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-02-13 - Legacy Button Styling Adaptation
**Learning:** Legacy CSS often styles links (`<a>`) as buttons using classes like `.btn_area`. Extending these selectors (e.g., `.btn_area a, .btn_area button`) allows for semantic upgrades to `<button>` elements without breaking existing styles or requiring a full CSS refactor.
**Action:** When converting link-based actions to buttons, check associated CSS and extend selectors to include `button` elements to maintain visual consistency.
