const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts");
const multiselect = require("inquirer-select-pro")

function isNumber(value) {
    return !isNaN(value) && typeof value !== 'boolean';
}

function recoverFromAppVersion(){
    const app_version_file = fs.readFileSync("src/version.json");

    const parsed_version = JSON.parse(app_version_file).version

    if(
        parsed_version === undefined ||
        parsed_version === null ||
        parsed_version === ""
    ){
        throw new Error("Cannot retrieve version from src/version.json")
    }

    return parsed_version

}

function recoverVersionFromPackageJson() {
    const packageJsonPath = path.resolve('package.json');
    const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if(!packageJsonContent.version.startsWith("v")) return `v.${packageJsonContent.version}`
    else return packageJsonContent.version
}

/**
 * Retrieves the most recent Git tag or the version from `package.json` if no Git tag exists.
 * 
 * This function attempts to get the most recent Git tag using the `git describe --tags --abbrev=0` command.
 * If no tag is found, it reads the version from `package.json` and returns it. If an error occurs during 
 * the Git command or reading `package.json`, it logs the error and returns `null`.
 * 
 * @function getLastGitTag
 * @returns {string|null} - The most recent Git tag, or the version from `package.json` if no tag is found, or `null` if an error occurs.
 */
function getLastGitTag() {
    try {
      const tag = execSync('git describe --tags --abbrev=0').toString().trim();
      return tag;
    } catch (error) {
      console.error('Errore nel recuperare la tag Git:', error);
      return null;
    }
}

async function getVersion(versionSource){

    let source

    if(
        versionSource === undefined ||
        versionSource === null ||
        versionSource === ""
    ) {
        const method_to_get_version = await select({
            message: "Where to get the version?",
            choices: [
                {
                    name: "package.json",
                    value: "package.json",
                    description: "Version got from package.json file"
                },
                {
                    name: "git-tag",
                    value: "git-tag",
                    description: "Version got from latest GIT TAG"
                },
                {
                    name: "in-app",
                    value: "in-app",
                    description: "Version got from APP version.json file"
                },
            ]
        })
    
        source = method_to_get_version
        
    } else {
        source = versionSource
    }
    
    switch(source){
        case "package.json": return recoverVersionFromPackageJson();
        case "git-tag": return getLastGitTag();
        case "in-app": return recoverFromAppVersion();
        default: return recoverVersionFromPackageJson();
    }


}

function convertVersionToObject(versionNumber){
    let versionObj = {}
    const version_number_splits = versionNumber.split(".")
    versionObj["major"] = parseInt(version_number_splits[0])
    versionObj["minor"] = parseInt(version_number_splits[1])
    versionObj["fix"] = parseInt(version_number_splits[2])
    return versionObj
}

async function setNewVersion(lastVersion){

    const type_of_version = await select({
        message: "What type of new version is this?\nFollow conventional versioning ${major}.${minor}.${fix}",
        choices: [
            {
                name: "major",
                value: "major",
                description: ""
            },
            {
                name: "minor",
                value: "minor",
                description: ""
            },
            {
                name: "fix",
                value: "fix",
                description: ""
            },
        ]
    })

    
    let new_version = lastVersion
    const new_version_splits = new_version.split(".")
    
    const is_there_env_in_version = new_version_splits[1]

    if(isNumber(is_there_env_in_version) === true){
        let numbered_version = new_version.split("v.")[1]
        let version_obj = convertVersionToObject(numbered_version)
        version_obj[type_of_version] += 1
        let new_numbered_version = Object.values(version_obj).join(".")
        new_version = `v.${new_numbered_version}`
    } else {
        let numbered_version = new_version.split(`v.${is_there_env_in_version}.`)[1]
        let version_obj = convertVersionToObject(numbered_version)
        version_obj[type_of_version] += 1
        let new_numbered_version = Object.values(version_obj).join(".")
        new_version = `v.${is_there_env_in_version}.${new_numbered_version}`
    }
    
    return new_version
}

async function setVersionEnvironment(version, environment){

    let new_version = version
    const new_version_splits = new_version.split(".")
    const first_dot = new_version.indexOf(".")

    if(
        environment === undefined ||
        environment === null ||
        environment === ""
    ) {
        
        const apply_different_environment = await select({
            message: "Select the environment to apply to version",
            choices: [
                {
                    name: "prod",
                    value: "",
                    description: "Production version -> v.${version-number}"
                },
                {
                    name: "stg",
                    value: "stg",
                    description: "Staging version -> v.stg.${version-number}"
                },
                {
                    name: "dev",
                    value: "dev",
                    description: "Development version -> v.dev.${version-number}"
                },
            ]
        })

        const is_there_env_in_version = new_version_splits[1]
        if(isNumber(is_there_env_in_version) === true){
            new_version = `v.${apply_different_environment !== "" ? `${apply_different_environment}.` : ""}${new_version.slice(first_dot + 1)}`
        } else {
            new_version = new_version.replace(`.${is_there_env_in_version}.`, apply_different_environment !== "" ? `.${apply_different_environment}.` : ".")
        }
        console.log(new_version)


    } else {

        const is_there_env_in_version = new_version_splits[1]
        if(isNumber(is_there_env_in_version) === true){
            new_version = `${new_version.slice(0, first_dot)}.${environment}${new_version.slice(first_dot)}`
        } else {
            new_version = new_version.replace(`${is_there_env_in_version}`, environment)
        }
        console.log(new_version)

    }

    return new_version

}

async function versionScript(){

    const ask_what_to_version = await multiselect.select({
        message: "Select what to version",
        options: [
            {
                name: "package.json",
                value: "package.json"
            },
            {
                name: "in-app",
                value: "in-app"
            },
            {
                name: "GIT",
                value: "git"
            }
        ]
    })

    const last_version_source = await select({
        message: "Select the version source to get reference",
        choices: [
            {
                name: "init",
                value: "init",
                description: "Initial version got from package.json"
            },
            {
                name: "package.json",
                value: "package.json",
                description: "Version got from package.json"
            },
            {
                name: "git-tag",
                value: "git-tag",
                description: "Version got from GIT TAG"
            },
            {
                name: "in-app",
                value: "in-app",
                description: "Version got from in app version file"
            },
        ]
    })

    let version

    if(last_version_source === "init") { version = await getVersion("package.json") }
    else { version = await getVersion(last_version_source) }

    let new_version = await setNewVersion(version)
    let new_version_environment = await setVersionEnvironment(new_version)

    return {
        version: new_version_environment,
        targets: ask_what_to_version
    }

}


module.exports = { getVersion, setNewVersion, setVersionEnvironment, getLastGitTag, versionScript }