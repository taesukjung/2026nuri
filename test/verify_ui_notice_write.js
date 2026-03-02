const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/archive/notice-write.html');
const content = fs.readFileSync(filePath, 'utf8');

let failed = false;

if (!content.includes('<button type="button" onclick="save()" id="saveBtn">저장</button>')) {
    console.error('Failed: Missing correct <button> for save');
    failed = true;
}

if (!content.includes('<button type="button" onclick="del()" id="delBtn" class="line">삭제</button>')) {
    console.error('Failed: Missing correct <button> for delete');
    failed = true;
}

if (!content.includes("var saveBtn = document.getElementById('saveBtn');")) {
    console.error('Failed: Missing save disabled state logic');
    failed = true;
}

if (!content.includes("var delBtn = document.getElementById('delBtn');")) {
    console.error('Failed: Missing delete disabled state logic');
    failed = true;
}

if (!failed) {
    console.log('Test passed: Notice write UI uses buttons with disabled state.');
} else {
    process.exit(1);
}
