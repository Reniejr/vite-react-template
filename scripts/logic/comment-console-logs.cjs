const fs = require('fs');
const path = require('path');

// Directory to scan
const dirPath = path.join(__dirname, '../src'); // Adjust this to your source directory

/**
 * Comments out all `console.log` statements in a given file.
 * 
 * This function reads the content of a specified file, replaces all occurrences 
 * of `console.log` with a commented version, and then writes the modified content 
 * back to the file.
 * 
 * @function commentConsoleLogs
 * @param {string} filePath - The path to the file to modify.
 * @returns {void}
 */
function commentConsoleLogs(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const modifiedData = data.replace(/(^|\s)(console\.log\([^;]*;?)/g, '$1//$2');
    
    fs.writeFileSync(filePath, modifiedData, 'utf8');
}

/**
 * Recursively walks through a directory and comments out all `console.log` statements in `.js` and `.jsx` files.
 * 
 * This function iterates through all files in the specified directory (and its subdirectories). 
 * If it encounters `.js` or `.jsx` files, it calls the `commentConsoleLogs` function to comment out 
 * `console.log` statements in those files.
 * 
 * @function walkDir
 * @param {string} dir - The directory to start walking through.
 * @returns {void}
 */
function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            commentConsoleLogs(fullPath);
        }
    });
}

walkDir(dirPath);
console.log('All console.log statements have been commented out.');
