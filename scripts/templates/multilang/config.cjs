/**
 *
 * @param languages
 */
function generateI18nConfigFile(languages){

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

    return `${languages_strings_imports}\n${export_template}`
}

module.exports = { generateI18nConfigFile }