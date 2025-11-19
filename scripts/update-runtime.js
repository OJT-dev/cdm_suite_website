const fs = require('fs');
const path = require('path');

const apiDir = path.join(process.cwd(), 'app', 'api');

function updateRouteFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("export const runtime = 'edge'")) {
        // Add it to the top or after imports
        const lines = content.split('\n');
        let insertIndex = 0;
        // Try to insert after imports
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                insertIndex = i + 1;
            } else if (lines[i].trim() !== '' && !lines[i].startsWith('//')) {
                // Found code that is not import or comment
                break;
            }
        }

        lines.splice(insertIndex, 0, "export const runtime = 'edge';", "");
        const newContent = lines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
    } else {
        console.log(`Skipped (already has runtime): ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (file === 'route.ts' || file === 'route.js') {
            updateRouteFile(fullPath);
        }
    }
}

traverseDir(apiDir);
