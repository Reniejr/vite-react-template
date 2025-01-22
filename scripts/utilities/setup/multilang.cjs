const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { select, input } = require("@inquirer/prompts");

const { insertLinesAt } = require("../index.cjs")
const { generateI18nConfigFile } = require("../../templates/multilang/config.cjs")
const { generateI18nFile } = require("../../templates/multilang/i18n.cjs")

const FLAG_NPM_PACKAGE = "flag-icons";

const MULTILANG_PACKAGE = "i18next i18next-browser-languagedetector react-i18next";

const DEFAULT_LANGUAGES = [
    {
        "lang": "en-US",
        "country": "gb",
        "label": "english",
        "key": "en",
    },
    {
        "lang": "it-IT",
        "country": "it",
        "label": "italiano",
        "key": "it"
    }
]

function updateMainFiles(){

    const main_file_path = "src/main.jsx"

    const i18n_import = `
// TRANSLATIONS - i18n configs
import './translations/i18n'
`;

    insertLinesAt(main_file_path, i18n_import, 3);

}

function writeI18nConfigfile(languages){

    const config_file_content = generateI18nConfigFile(languages)

    fs.writeFileSync("src/translations/config.js", config_file_content)

    languages.forEach( lang => {

        fs.writeFileSync(`src/translations/strings/${lang.key}.json`, JSON.stringify({"hello": "world"}))

    })

}

async function multilang_setup(){

    console.log("Setting up multilanguage handlers.....")

    let all_languages = [ ...DEFAULT_LANGUAGES ]

    let add_language = true

    while(add_language === true){

        all_languages.forEach( l => {
            console.log("Language already set: ", l)
        })

        const ask_if_add_language = await select({
            "message": "Add another language?",
            "choices": [
                {
                    name: "Yes",
                    value: true
                },
                {
                    name: "No",
                    value: false
                }
            ]
        })

        if(ask_if_add_language === false){
            add_language = false;
            break;
        }

        const ask_language = await input({
            "message": "Type language code ( BCP 47 standard ex: it-IT ( italian-Italy ) )",
            "required": true,
            "validate": ( value ) => value !== ""
        })
        
        const ask_country = await input({
            "message": "Type the country ( ISO-CODE-2 ex: it (Italy) )",
            "required": true,
            "validate": ( value ) => value !== ""
        })
        
        const ask_label = await input({
            "message": "Type the label ( ex: it => italiano )",
            "required": true,
            "validate": ( value ) => value !== ""
        })

        all_languages.push({ lang: ask_language, country: ask_country, label: ask_label, key: ask_language.substring(0, 2) })
    }

    if( all_languages.length > 0){

        console.log("Installing flag library...")
        execSync(`npm i ${FLAG_NPM_PACKAGE}`)
        console.log("Installing multilang handlers library...")
        execSync(`npm i ${MULTILANG_PACKAGE}`)
    
        console.log("Setting up multilang config files")
        const translation_directory = "src/translations"
        const translation_strings_directory = "src/translations/strings"
    
        if(!fs.existsSync(translation_directory)){
            fs.mkdirSync(path.resolve(translation_directory))
        }
    
        if(!fs.existsSync(translation_strings_directory)){
            fs.mkdirSync(path.resolve(translation_strings_directory))
        }

        updateMainFiles()

        writeI18nConfigfile(all_languages)
    
        const i18n_file_content = generateI18nFile()
        fs.writeFileSync("src/translations/i18n.js", i18n_file_content)
        console.log("Multilang feature added.")
    } else {
        console.log("No languages added")
        return
    }

}

multilang_setup()