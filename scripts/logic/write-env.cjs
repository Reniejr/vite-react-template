const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts")

const DEFAULT_FILES_TO_EXCLUDE = [
    ".eslintrc.cjs",
    ".firebaserc",
    ".gitignore",
    "eslint.config.js",
    "firebase.json",
    "index.html",
    "jsconfig.json",
    "package-lock.json",
    "package.json",
    "README.md",
    "vite.config.js"
]

/**
 *
 * @param exclude
 */
function getFiles(exclude = []){

    const currentDir = process.cwd(); // Get the current directory
    return fs
        .readdirSync(currentDir) // Read directory contents
        .filter(file => {
            const isFile = fs.statSync(path.join(currentDir, file)).isFile(); // Check if it's a file
            return isFile && !exclude.includes(file); // Exclude specified files
        });

}

/**
 *
 */
function getEnvFiles(){
    const currentDir = process.cwd(); // Get the current directory
    return fs
        .readdirSync(currentDir) // Read directory contents
        .filter(file => {
            const isFile = fs.statSync(path.join(currentDir, file)).isFile(); // Check if it's a file
            return isFile && file.startsWith(".ENV_"); // Exclude specified files
        });
}

/**
 *
 * @param filename
 */
async function readFile(filename){

    try {
        const fileExt = path.extname(filename).toLowerCase();

        if (![".txt", ".json"].includes(fileExt)) {
            throw new Error("Unsupported file type. Only .txt and .json are allowed.");
        }

        const content = fs.readFileSync(filename, "utf-8");

        if (fileExt === ".txt") {
        // Return each line as a string in the array
            return content.split(/\r?\n/).filter(line => line.trim() !== "");
        }

        if (fileExt === ".json") {
            const jsonObject = JSON.parse(content);
            // Return all property keys as strings
            const properties = Object.keys(jsonObject);

            const ask_which_property_to_get = await select({
                message: "Which property to read?",
                choices: properties.map( p => ({ name: p, value: p}))
            })

            const json_property_selected = jsonObject[ask_which_property_to_get]

            if(typeof json_property_selected !== "object" && !Array.isArray(json_property_selected)){
                throw new Error("The value must be an array")
            }

            const find_value_different_from_string = json_property_selected.find( v => typeof v !== "string")

            if(find_value_different_from_string !== null || find_value_different_from_string !== undefined){
                throw new Error("The array must contain only strings")
            }

            return json_property_selected

        }
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return null;
    }

}

/**
 * Merges environment variable files starting with `.ENV_` into a single `.env` file.
 * 
 * This function reads all files in the specified directory that start with `.ENV_`, processes 
 * each file to append its content to a single `.env` file. It adds the filename as a comment for 
 * each line and removes unnecessary newlines. The merged content is written to a new `.env` file, 
 * overwriting the existing one if necessary.
 * 
 * @function mergeEnvFiles
 * @returns {void}
 */
function mergeEnvFiles() {
    const directoryPath = path.resolve(__dirname, "../../"); // Adjust this if needed
    const envFilePath = path.join(directoryPath, ".env");
  
    // Clear the .env file if it already exists
    if (fs.existsSync(envFilePath)) {
        fs.writeFileSync(envFilePath, ""); // Clears the file content
    }

    const envFiles = fs.readdirSync(directoryPath).filter(file => file.startsWith(".ENV_"));
  
    let envContent = "";

    envFiles.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const fileName = path.basename(file).replace(".ENV_", "");
        let fileContent = fs.readFileSync(filePath, "utf8");

        // Process each line to add the filename to comments and remove unnecessary newlines
        fileContent = fileContent.split("\n").map(line => {
            if (line.trim().startsWith("#")) {
                return `${line.trim()} ${fileName}`;
            }
            return line.trim(); // Remove any leading or trailing whitespace
        }).join("\n");

        envContent += `${fileContent}\n`;
    });

    // Write the processed content to the .env file
    fs.writeFileSync(envFilePath, envContent.trim() + "\n"); // Trim and ensure a final newline

    console.log(`.env file has been generated with content from ${envFiles.length} files.`);
}

/**
 *
 */
async function updateEnvFile(){

    const directoryPath = path.resolve(__dirname, "../../"); // Adjust this if needed
    const envFilePath = path.join(directoryPath, ".env");

    if (fs.existsSync(envFilePath)) {
        fs.writeFileSync(envFilePath, ""); // Clears the file content
    }

    const ask_operation_type = await select({
        message: "Create or Update environment variables?",
        choices: [
            {
                name: "create",
                value: "create",
                description: "Create .env file and choose where to pick variables"
            },
            {
                name: "update",
                value: "update",
                description: "Update .env file"
            }
        ]
    })

    if( ask_operation_type === "create"){
    // Choose if create blank or from file
        const files_in_directory = getFiles(DEFAULT_FILES_TO_EXCLUDE)
  
        if(files_in_directory.length === 0){
            throw new Error("You must have a file of a list of environment stages")
        }

        const ask_where_to_pick_environment_list = await select({
            message: "Get the list of available environment stages from:",
            choices: files_in_directory.map( f => ({ name: f, value: f}))
        })

        const file_content = await readFile(ask_where_to_pick_environment_list)

        const ask_which_env_to_select = await select({
            message: "Choose environment:",
            choices: file_content.map( lineCode => ({ name: lineCode, value: lineCode }))
        })

        const ENV_FILES = getEnvFiles()

        const ENV_FILE_SELECTED = `.ENV_${ask_which_env_to_select.toUpperCase()}`

        if(!ENV_FILES.includes(ENV_FILE_SELECTED)){
            const error_msg = `.ENV_${ask_which_env_to_select.toUpperCase()} not found. Create one`
            console.error(error_msg)
            return;
        }

        let envContent = "";

        const filePath = path.join(directoryPath, ENV_FILE_SELECTED);
        const fileName = path.basename(ENV_FILE_SELECTED).replace(".ENV_", "");
        let fileContent = fs.readFileSync(filePath, "utf8");

        // Process each line to add the filename to comments and remove unnecessary newlines
        fileContent = fileContent.split("\n").map(line => {
            if (line.trim().startsWith("#")) {
                return `${line.trim()} ${fileName}`;
            }
            return line.trim(); // Remove any leading or trailing whitespace
        }).join("\n");

        envContent += `${fileContent}\n`;

        fs.writeFileSync(envFilePath, envContent.trim() + "\n"); // Trim and ensure a final newline

        console.log(`.env file has been updated with content from ${ENV_FILE_SELECTED} file.`);
    
    } else {

        const ask_update_type = await select({
            message: "Type of update:",
            choices: [
                {
                    name: "environment-stage",
                    value: "environment-stage",
                    description: "Update env file selecting from a list of environemnt stages ( ex. prod, stg, dev )"
                },
                {
                    name: "merge",
                    value: "merge",
                    description: "Merging all .ENV_{{variable}} files in .env"
                }
            ]
        })
  
        if( ask_update_type === "environment-stage"){
      
            const files_in_directory = getFiles(DEFAULT_FILES_TO_EXCLUDE)
  
            if(files_in_directory.length === 0){
                throw new Error("You must have a file of a list of environment stages")
            }
  
            const ask_where_to_pick_environment_list = await select({
                message: "Get the list of available environment stages from:",
                choices: files_in_directory.map( f => ({ name: f, value: f}))
            })
  
            const file_content = await readFile(ask_where_to_pick_environment_list)
  
            const ask_which_env_to_select = await select({
                message: "Choose environment:",
                choices: file_content.map( lineCode => ({ name: lineCode, value: lineCode }))
            })
  
            const ENV_FILES = getEnvFiles()
  
            const ENV_FILE_SELECTED = `.ENV_${ask_which_env_to_select.toUpperCase()}`
  
            if(!ENV_FILES.includes(ENV_FILE_SELECTED)){
                const error_msg = `.ENV_${ask_which_env_to_select.toUpperCase()} not found. Create one`
                console.error(error_msg)
                return;
            }
  
            let envContent = "";
  
            const filePath = path.join(directoryPath, ENV_FILE_SELECTED);
            const fileName = path.basename(ENV_FILE_SELECTED).replace(".ENV_", "");
            let fileContent = fs.readFileSync(filePath, "utf8");
  
            // Process each line to add the filename to comments and remove unnecessary newlines
            fileContent = fileContent.split("\n").map(line => {
                if (line.trim().startsWith("#")) {
                    return `${line.trim()} ${fileName}`;
                }
                return line.trim(); // Remove any leading or trailing whitespace
            }).join("\n");
  
            envContent += `${fileContent}\n`;
  
            fs.writeFileSync(envFilePath, envContent.trim() + "\n"); // Trim and ensure a final newline
  
            console.log(`.env file has been updated with content from ${ENV_FILE_SELECTED} file.`);
  
  
        }
  
        if ( ask_update_type === "merge"){
            mergeEnvFiles()
        }
    }


}

// mergeEnvFiles();
updateEnvFile()