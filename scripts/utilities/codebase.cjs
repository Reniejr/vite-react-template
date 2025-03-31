const path = require("path");
const { readJson, writeFile } = require("./index.cjs");
const prettier = require("prettier");
const LOGGER = require("./logger.cjs");

const PACKAGEJSON = path.resolve(__dirname, "../../package.json");

async function updatePackageJson(content, field){

    const packageJsonContent = readJson(PACKAGEJSON)

    let newPackageJsonContent = {
        ...packageJsonContent
    }

    if(packageJsonContent.hasOwnProperty(field)){

        newPackageJsonContent[field] = {
            ...newPackageJsonContent[field],
            ...content
        }
    } else {
        newPackageJsonContent[field] = content
    }

    const stringified = JSON.stringify(newPackageJsonContent)
    const prettiefied = await prettier.format(stringified, { parser: "json"});

    writeFile(PACKAGEJSON, prettiefied);

    LOGGER.box("Package.json update")


}

module.exports.updatePackageJson = updatePackageJson