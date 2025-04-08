const prettier = require("prettier");
/**
 *
 * @param languages
 */
async function generateI18nConfigFile(languages){

    const languages_strings_imports = languages.map(language => `import ${language.key} from './strings/${language.key}.json'`).join("\n")
    
    const export_template = `
export const resources = {
    ${languages.map( lang => {
        return `${lang.key}: {
            translation: ${lang.key},
            language: "${lang.label}"
        }`
    }).join(",\n")}
}
    `

    const template = `${languages_strings_imports}\n${export_template}`

    const prettifiedTemplate = await prettier.format(template, { parser: "typescript"});

    return prettifiedTemplate
}

module.exports = { generateI18nConfigFile }
