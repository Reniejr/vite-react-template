const path = require("path")
const fs = require("fs")
const { input, select } = require("@inquirer/prompts")

//* TEMPLATES
const { generateReactJSXComponent } = require("../templates/reactjs.cjs")

//* HANDLERS
const { initSCSSFile } = require("../utilities/scss-file.cjs")

/**
 * Creates a new UI JSX file with a generated React functional component template.
 * 
 * This function generates a UI JSX component file using the provided filename,
 * creates the specified directory if it doesn't exist, and writes the
 * generated component to a `.jsx` file in the given file path.
 * 
 * @function createUIComponentJSX
 * @param {string} filename - The name of the React component (without file extension).
 * @param {string} filePath - The path where the component file should be created.
 * @returns {void}
 */
function createUIComponentJSX(filename, filePath){

    const JSX_COMPONENT = generateReactJSXComponent(filename)

    fs.mkdir(filePath, { recursive: true }, (err) => {
        if(err) {
            console.error("Error creating directory", err)
            return
        } else {
            fs.writeFile(`${filePath}/${filename}.jsx`, JSX_COMPONENT, (err) => {
                if (err) {
                    console.error("Error creating file:", err);
                    return
                } else {
                    console.log(`${filename}.jsx created successfully.`);
                }
            });
        }
    })

}

/**
 * Creates a new SCSS file and initializes it with content from the main styles file.
 * 
 * This function creates the specified directory if it doesn't exist, generates an 
 * empty `.module.scss` file for the given filename, and initializes the file with 
 * imports or other content using the `initSCSSFile` function.
 * 
 * @function createSCSSFile
 * @param {string} filename - The name of the SCSS file (without file extension).
 * @param {string} filePath - The path where the SCSS file should be created.
 * @returns {void}
 */
function createSCSSFile(filename, filePath){
    fs.mkdir(filePath, { recursive: true }, (err) => {
        if(err){
            console.error("Error creating directory", err)
            return
        } else {
            fs.writeFile(`${filePath}/${filename}.module.scss`, "", (err) => {
                if (err) {
                    console.error("Error creating file:", err);
                    return
                } else {
                    console.log(`${filename}.module.scss created successfully.`);
                    initSCSSFile("src/styles/main.scss", `${filePath}/${filename}.module.scss`)
                }
            });
        }
    })
}

/**
 * Creates a new UI component by prompting the user for the component name and directory.
 * 
 * This function interactively gathers input for the component's name and location, then 
 * generates the corresponding JSX and SCSS files in the specified directory.
 * 
 * @async
 * @function createUIComponent
 * @returns {Promise<void>} - A promise that resolves when the UI component has been created.
 */
async function createUIComponent(){

    const ask_component_name = {
        componentName: await input({ message: "Insert component name" })
    }

    if(!ask_component_name.componentName || ask_component_name.componentName === ""){

        console.error("!! Component Name is required !!")
        return

    }

    const ask_component_directory_position = await select({
        message: "Where do you want to insert the component ?",
        choices: [
            {
                name: "default_component",
                value: "default-component",
                description: "Default @components folder"
            },
            {
                name: "custom_position",
                value: "custom-position",
                description: "Custom component position"
            }
        ]
    })

    let custom_directory

    if(ask_component_directory_position === "custom-position"){
        const ask_component_custom_directory = await input({ message: "Insert the custom path ( without '.src' ) "})
        custom_directory = path.resolve(`src${ask_component_custom_directory}/${ask_component_name.componentName}`).replace(/\\/g, "/")
    }

    if(ask_component_directory_position === "default-component"){
        custom_directory = path.resolve(`src/components/${ask_component_name.componentName}`).replace(/\\/g, "/")
    }
    
    createUIComponentJSX(ask_component_name.componentName, custom_directory)
    createSCSSFile(ask_component_name.componentName, custom_directory)


}

createUIComponent()