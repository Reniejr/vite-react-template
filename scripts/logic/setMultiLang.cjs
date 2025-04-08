const { generateI18nConfigFile } = require("../templates/multilang/config.cjs");
const { generateI18nFile } = require("../templates/multilang/i18n.cjs");
const { generateTranslationsFiles } = require("../utilities/multilang.cjs");
const { input, select } = require("@inquirer/prompts");
const LOGGER = require("../utilities/logger.cjs");
const { readPackageJson } = require("../utilities/codebase.cjs");
const { insertAfterLastImport, getMainViteAppFiles, writeFile } = require("../utilities/index.cjs")
const { execSync } = require("child_process");
const fs = require("fs");

async function run(){

    const { dependencies } = readPackageJson();

    if(
        !dependencies.hasOwnProperty("i18next") ||
        !dependencies.hasOwnProperty("i18next-browser-languagedetector") ||
        !dependencies.hasOwnProperty("react-i18next")
    ) {

        execSync("npm i i18next i18next-browser-languagedetector react-i18next", { stdio: "inherit"})
        LOGGER.box("Dependencies installed!")
    }

    let newLangs = []

    let newLang = "";
    let adding = true;

    
    while(adding){
        
        newLang = await input({message: "Insert lang ( ISO CODE 2 ) *Leave empty to finish"})

        if(newLang !== ""){
            newLangs.push(newLang)
            newLang = ""
        } else {
            break;
        }


    }

    await generateTranslationsFiles(newLangs)

    const defaultLanguage = await select({
        message: "Select the default language",
        choices: newLangs.map( l => ({ value: l, name: l }))
    })

    let langsForConfig = []

    for (let i = 0; i < newLangs.length; i++) {
        
        const langLabel = await input({ message: `Set label for language: ${newLangs[i]}`})
    
        langsForConfig.push({
            key: newLangs[i],
            label: langLabel
        })
        
    }
    
    const configFile = await generateI18nConfigFile(langsForConfig)

    writeFile(`../../src/translations/config.js`, configFile)
    
    const i18nFile = await generateI18nFile(defaultLanguage)
    
    writeFile(`../../src/translations/i18n.js`, i18nFile)

    const mainFilePath = getMainViteAppFiles("main.jsx");

    const mainFileContent = fs.readFileSync(mainFilePath, { encoding: "utf-8"})

    if(!mainFileContent.includes("import './translations/i18n'")){

        insertAfterLastImport(mainFilePath, "import './translations/i18n'")
    }


    LOGGER.box("i18 files set")

}

run()