const prettier = require("prettier");
const LOGGER = require("./logger.cjs");
const { writeFile } = require("./index.cjs");

async function generateTranslationsFiles(langs){

    await Promise.all(
        langs.map( async function(lang){
    
            const langTemplate = `{
"hello-world": "Hello World"
}`;
    
            const prettifiedTemplate = await prettier.format(langTemplate, { parser: "json"})

            writeFile(`../../src/translations/strings/${lang}.json`, prettifiedTemplate)

            LOGGER.box(`Initialized ${lang} translation file`)
    
        })
    )

    LOGGER.box("All languages set")

    return;

}

module.exports.generateTranslationsFiles = generateTranslationsFiles