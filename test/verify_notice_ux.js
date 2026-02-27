const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Path to the notice-write.html file
const filePath = path.join(__dirname, '../views/archive/notice-write.html');

try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Verification 1: Check for the semantic button element
    const buttonRegex = /<button type="button" onclick="save\(this\);">저장<\/button>/;
    assert.match(content, buttonRegex, 'The "Save" element should be a semantic <button> with onclick="save(this)"');
    console.log('✅ Verification 1 Passed: Semantic button found.');

    // Verification 2: Check for the save function signature update
    const functionSignatureRegex = /function save\(btn\) \{/;
    assert.match(content, functionSignatureRegex, 'The save function should accept a "btn" argument');
    console.log('✅ Verification 2 Passed: save(btn) function signature found.');

    // Verification 3: Check for the loading state logic
    const loadingLogicRegex = /if \(btn\) \{\s*btn\.disabled = true;\s*btn\.innerText = "저장 중\.\.\.";\s*\}/;
    // We normalize whitespace for the check
    const normalizedContent = content.replace(/\s+/g, ' ');
    const normalizedRegex = /if \(btn\) \{ btn\.disabled = true; btn\.innerText = "저장 중\.\.\."; \}/;

    assert.match(normalizedContent, normalizedRegex, 'The save function should contain logic to disable the button and change text to "저장 중..."');
    console.log('✅ Verification 3 Passed: Loading state logic found.');

    console.log('\n🎉 All verifications passed! The UX improvements are correctly implemented.');

} catch (err) {
    console.error('\n❌ Verification Failed:', err.message);
    process.exit(1);
}
