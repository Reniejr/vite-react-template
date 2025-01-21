const fs = require("fs");
const path = require("path");
const multiSelect = require("inquirer-select-pro");
const { select, type } = require("@inquirer/prompts");

function logger(type, message){

    switch(type){
        case 'success':
            console.log(`\x1b[42m ${message} \x1b[42m`);
            break;
        case 'info':
            console.log(`\x1b[44m ${message} \x1b[44m`);
            break;
        case 'warn':
            console.log(`\x1b[43m ${message} \x1b[43m`);
            break;
        case 'error':
            console.log(`\x1b[41m ${message} \x1b[41m`);
            break;
        default:
            console.log(message);
            break;
    }

}

const DEFAULT_IGNORE_LIST = [
    ".git/",
    ".gitignore",
    "eslint.config.js",
    "index.html",
    "jsconfig.json",
    "node_modules/",
    "package-lock.json",
    "package.json",
    "public/",
    "README.md",
    "vite.config.js"
]

/**
 * Reads all files and folders in the current directory
 * @returns {Object} - An object containing arrays of files and folders
 */
function readCurrentDirectory(pathToRead = undefined, ignoreList = []) {
    const currentPath = pathToRead ? path.resolve(process.cwd(), pathToRead) : process.cwd();
    let result = []
    let list_to_ignore = DEFAULT_IGNORE_LIST.concat(ignoreList)

    try {
        const items = fs.readdirSync(currentPath);

        items.forEach(item => {
            const fullPath = path.join(currentPath, item);
            const stats = fs.statSync(fullPath);

            if (stats.isFile()) {
                result.push(item);
            }
        });
        
        if(list_to_ignore.length > 0){
            result = result.filter(c => !list_to_ignore.includes(c))
        }

        return result

    } catch (error) {
        console.error('Error reading the directory:', error);
    }

    return result;
}

async function selectInDirectory(filesInDir){

    if(
        filesInDir === undefined ||
        filesInDir === null ||
        !Array.isArray(filesInDir) ||
        filesInDir.length === 0
    ){
        throw new Error("There's no files to select")
    }

    try {
        const files_selected = await multiSelect.select({
            message: "Select files:",
            options: filesInDir.map( f => ({ name: f, value: f }))
        })
    
        return files_selected
        
    } catch (error) {
        console.error('Cannot select files', error)
    }

}

module.exports = { logger, readCurrentDirectory, selectInDirectory };