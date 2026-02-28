const fs = require('fs');
const path = require('path');

function testRefController() {
    const filePath = path.join(__dirname, '../routes/refController.js');
    const content = fs.readFileSync(filePath, 'utf8');

    // Simple parser to extract the /insert route handler body
    const insertRouteRegex = /router\.post\('\/insert'[\s\S]*?\.then\(result => \{([\s\S]*?)\}\);/g;
    let match;
    let foundInsert = false;
    while ((match = insertRouteRegex.exec(content)) !== null) {
        foundInsert = true;
        const handlerBody = match[1];
        if (handlerBody.includes('tbl_ref.findAll')) {
            console.error('FAIL: tbl_ref.findAll found in /insert route handler of refController.js');
            process.exit(1);
        }
        if (handlerBody.includes('tbl_ref.count')) {
            console.error('FAIL: tbl_ref.count found in /insert route handler of refController.js');
            process.exit(1);
        }
    }

    if (!foundInsert) {
        console.error('FAIL: /insert route handler not found in refController.js');
        process.exit(1);
    }

    // Simple parser to extract the /getContent route handler body
    const getContentRouteRegex = /router\.get\('\/getContent'[\s\S]*?\{([\s\S]*?)\}\)/g;
    let foundGetContent = false;
    while ((match = getContentRouteRegex.exec(content)) !== null) {
        foundGetContent = true;
        const handlerBody = match[1];
        if (handlerBody.includes('findAndCountAll')) {
            console.error('FAIL: findAndCountAll found in /getContent route handler of refController.js');
            process.exit(1);
        }
        if (!handlerBody.includes('findAll')) {
            console.error('FAIL: findAll not found in /getContent route handler of refController.js');
            process.exit(1);
        }
    }

    if (!foundGetContent) {
        console.error('FAIL: /getContent route handler not found in refController.js');
        process.exit(1);
    }

    console.log('PASS: refController.js performance tests passed');
}

testRefController();