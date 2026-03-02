## 2026-02-10 - Inquiry Form Accessibility & Interaction
**Learning:** The public inquiry form (`views/contact/inquiry.html`) was completely inaccessible to keyboard users (link-based submission) and lacked any feedback during submission, which is critical for a contact form.
**Action:** Replace `<a>` with `<button type="submit">`, add hidden labels for screen readers, and implement a loading state during form submission. Apply similar patterns to other forms if encountered.

## 2026-02-11 - Admin Write Form Accessibility & Feedback
**Learning:** The notice write form (`views/archive/notice-write.html`) lacked keyboard accessibility for standard submit and delete actions due to the usage of `<a>` links invoking `javascript:` methods, and gave no visual feedback preventing multiple submissions.
**Action:** Replace `<a>` tags targeting `javascript:` with actual `<button type="button">` elements. Incorporate button-disabling logic into the submission JavaScript functions, altering text content to show a processing state (e.g., "저장 중...").
