const fs = require("fs")
const path = require("path")

function updateInAppVersion(newVersion){

    const versionFilePath = path.resolve("src/version.json")

    let new_version_file_content = {
        version: newVersion
    }
    
    fs.writeFileSync(versionFilePath, JSON.stringify(new_version_file_content))

    console.log(`Version in app updated to: ${newVersion}`)



}

module.exports = { updateInAppVersion }