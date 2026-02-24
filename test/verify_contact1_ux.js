const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../public/css/sub.css');
const htmlPath = path.join(__dirname, '../views/contact/contact1_write.html');

const cssContent = fs.readFileSync(cssPath, 'utf8');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Check CSS
// Normalize whitespace for check
const normalizedCss = cssContent.replace(/\s+/g, ' ');

if (!normalizedCss.includes('.btn_area a, .btn_area button')) {
     console.error('CSS missing .btn_area button selector');
     process.exit(1);
}

if (!normalizedCss.includes('.btn_area button:disabled')) {
    console.error('CSS missing disabled state for button');
    process.exit(1);
}

// Check HTML
if (!htmlContent.includes('<button type="button" onclick="save(this);">저장</button>')) {
    console.error('HTML missing save button');
    process.exit(1);
}

// Check JS
if (!htmlContent.includes('btn.disabled = true;')) {
    console.error('JS missing loading state logic (btn.disabled)');
    process.exit(1);
}

if (!htmlContent.includes('btn.innerText = "저장 중...";')) {
    console.error('JS missing loading state logic (btn.innerText)');
    process.exit(1);
}


console.log('Verification passed!');
