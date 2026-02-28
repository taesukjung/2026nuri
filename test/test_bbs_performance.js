const fs = require('fs');
const path = require('path');

function testBbsController() {
    const filePath = path.join(__dirname, '../routes/bbsController.js');
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the /getContent route handler body
    const getContentRouteRegex = /router\.get\('\/getContent'[\s\S]*?\{([\s\S]*?)\}\)/g;
    let match;
    let foundGetContent = false;
    while ((match = getContentRouteRegex.exec(content)) !== null) {
        foundGetContent = true;
        const handlerBody = match[1];
        if (handlerBody.includes('findAndCountAll')) {
            console.error('FAIL: findAndCountAll found in /getContent route handler of bbsController.js');
            process.exit(1);
        }
        if (!handlerBody.includes('findAll')) {
            console.error('FAIL: findAll not found in /getContent route handler of bbsController.js');
            process.exit(1);
        }
    }

    if (!foundGetContent) {
        console.error('FAIL: /getContent route handler not found in bbsController.js');
        process.exit(1);
    }

    // Also check insert route
    const insertRouteRegex = /router\.post\('\/insert'[\s\S]*?\.then\(result => \{([\s\S]*?)\}\);/g;
    let foundInsert = false;
    while ((match = insertRouteRegex.exec(content)) !== null) {
        foundInsert = true;
        const handlerBody = match[1];
        if (handlerBody.includes('tbl_bbs.count')) {
            console.error('FAIL: tbl_bbs.count found in /insert route handler of bbsController.js');
            process.exit(1);
        }
    }

    if (!foundInsert) {
        console.error('FAIL: /insert route handler not found in bbsController.js');
        process.exit(1);
    }

    console.log('PASS: bbsController.js performance tests passed');
}

testBbsController();