## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-03-10 - Icon Button Accessibility
**Learning:** Icon-only interactive elements in the navigation (like the language selector globe icon) were implemented as plain `<img>` tags, making them inaccessible to keyboard users and screen readers.
**Action:** Always wrap interactive icon-only elements in semantic `<button type="button">` tags. Add descriptive `aria-label` attributes for screen readers and apply inline CSS resets (`background: none; border: none; padding: 0; cursor: pointer;`) to maintain visual layout without adding custom CSS classes.
