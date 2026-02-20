const fs = require('fs');
const assert = require('assert');
const path = require('path');

const viewPath = path.join(__dirname, '../views/contact/contact1_write.html');
const cssPath = path.join(__dirname, '../public/css/sub.css');

const htmlContent = fs.readFileSync(viewPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Verify CSS
assert.ok(cssContent.includes('.btn_area a,'), 'CSS should target .btn_area a');
assert.ok(cssContent.includes('.btn_area button {'), 'CSS should target .btn_area button');

// Verify HTML Buttons
assert.ok(htmlContent.includes('<button type="button" onclick="save(this);">저장</button>'), 'Save button should exist');
assert.ok(htmlContent.includes('<button type="button" onclick="del(this);">삭제</button>'), 'Delete button should exist');

// Verify JS Logic
assert.ok(htmlContent.includes('function save(btn) {'), 'save function should accept btn');
assert.ok(htmlContent.includes('btn.disabled = true;'), 'save function should disable btn');
assert.ok(htmlContent.includes('btn.innerText = "저장중...";'), 'save function should show loading text');

assert.ok(htmlContent.includes('function del(btn) {'), 'del function should accept btn');
assert.ok(htmlContent.includes('btn.innerText = "삭제중...";'), 'del function should show loading text');

console.log('Verification Passed!');
