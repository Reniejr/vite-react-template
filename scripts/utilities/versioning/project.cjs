const fs = require("fs")
const path = require("path")

function updatePackageJson(newVersion){

    const packageJsonPath = path.resolve("package.json")
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8")
    const parsed_content = JSON.parse(packageJsonContent)
    
    let new_content = { ...parsed_content }

    new_content.version = newVersion

    const new_content_stringified = JSON.stringify(new_content, null, 2)

    try {
        fs.writeFileSync(path.resolve("package.json"), new_content_stringified)
        console.log(`package.json updated to version: ${newVersion}`)
    } catch (error) {
        console.error(error)
    }

}

module.exports = { updatePackageJson }