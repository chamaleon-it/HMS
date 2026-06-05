const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dirPath));
        }
    });
}

function replaceInFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: {fAge(x).years}y {fAge(y).months}m  -> {fAge(x).formatted}
    content = content.replace(/\{fAge\(([^)]+)\)\.years\}y\s*\/?\s*\{fAge\(([^)]+)\)\.months\}m/g, (match, p1) => `{fAge(${p1}).formatted}`);

    // Pattern 2: ${fAge(x).years}y ${fAge(y).months}m -> ${fAge(x).formatted}
    content = content.replace(/\$\{fAge\(([^)]+)\)\.years\}y\s*\/?\s*\$\{fAge\(([^)]+)\)\.months\}m/g, (match, p1) => `\${fAge(${p1}).formatted}`);

    // Check for some more weird ones:
    // e.g. {fAge(r?.patient?.dateOfBirth).years}y {fAge(r?.patient?.dateOfBirth).months}m
    // This is already caught by Pattern 1.

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

walkDir('./app', replaceInFile);
walkDir('./components', replaceInFile);
