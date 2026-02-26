
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/contact/contact1_write.html');
const cssPath = path.join(__dirname, '../public/css/sub.css');

function check() {
    console.log("Verifying UX improvements in contact1_write.html and sub.css...");

    let passed = true;

    try {
        const htmlContent = fs.readFileSync(filePath, 'utf8');
        const cssContent = fs.readFileSync(cssPath, 'utf8');

        // Check HTML for semantic button and save logic
        if (htmlContent.includes('<button type="button" onclick="save(this)">저장</button>')) {
            console.log("✅ HTML: Semantic button element found.");
        } else {
            console.log("❌ HTML: Semantic button element NOT found.");
            passed = false;
        }

        if (htmlContent.includes('btn.disabled = true;')) {
            console.log("✅ HTML: Loading state logic (disabled) found.");
        } else {
            console.log("❌ HTML: Loading state logic (disabled) NOT found.");
            passed = false;
        }

        // Check CSS for button styling and disabled state
        if (cssContent.includes('.btn_area a,') && cssContent.includes('.btn_area button {')) {
            console.log("✅ CSS: Selector updated to include button.");
        } else {
            console.log("❌ CSS: Selector NOT updated to include button.");
            passed = false;
        }

        if (cssContent.includes('.btn_area button:disabled')) {
            console.log("✅ CSS: Disabled state style found.");
        } else {
            console.log("❌ CSS: Disabled state style NOT found.");
            passed = false;
        }
    } catch (err) {
        console.error("❌ Error reading files:", err);
        passed = false;
    }

    return passed;
}

if (require.main === module) {
    if (check()) {
        console.log("All checks passed!");
        process.exit(0);
    } else {
        console.log("Some checks failed.");
        process.exit(1);
    }
}
