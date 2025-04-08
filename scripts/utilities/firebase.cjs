const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts");
const prettier = require("prettier");

// TEMPLATES
const { initAppFile } = require("../templates/firebase.cjs");

// Utilities
const { writeFile, readJson, runCommand } = require("./index.cjs");
const LOGGER = require("./logger.cjs")

const FIREBASE_FILES_PATHS = {
    "app": {
        "init": path.resolve(__dirname, "../../src/services/firebase/app.js")
    },
    "configs": {
        "rc": path.resolve(__dirname, "../../.firebaserc"),
        "settings": path.resolve(__dirname, "../../firebase.json")
    },
    "secrets": {
        "folder": path.resolve(__dirname, "../secrets/firebase")
    }
}

module.exports.FIREBASE_FILES_PATHS = FIREBASE_FILES_PATHS;

const FIREBASE_CMD = {
    "project": {
        "get": "firebase use"
    },
    "app": {
        "list": (projectId) => `firebase hosting:sites:list --json --project ${projectId}`
    }
}

module.exports.FIREBASE_CMD = FIREBASE_CMD;

/**
 * Merges two configuration objects, giving precedence to the local configurations.
 *
 * @param {Object} configs - The original configuration object.
 * @param {Object} localConfigs - The local configuration object that will override the original configurations.
 * @returns {Object} A new configuration object with properties from both input objects, where localConfigs take precedence.
 */
async function localizeConfigs(configs, localConfigs){

    return {
        ...configs,
        ...localConfigs
    }

}
module.exports.localizeConfigs = localizeConfigs;

/**
 * Retrieves the current Firebase project ID in use.
 *
 * @returns {string} The ID of the current Firebase project.
 */
function getCurrentProjectID(){

    const projectID = runCommand(FIREBASE_CMD.project.get, { toConvert: false });

    return projectID.toString().trim();

}
module.exports.getCurrentProjectID = getCurrentProjectID;

/**
 * Prompts the user to select a Firebase project to switch to from the available projects.
 *
 * @returns {Promise<string>} The ID of the selected Firebase project.
 * If no projects are found, logs an error and returns undefined.
 */
async function switchProject(){

    const { projects } = readJson(FIREBASE_FILES_PATHS.configs.rc);

    if(Object.keys(projects).length === 0){
        LOGGER.error("No projects found in Firebase configuration.");
        return;
    }

    const choices = Object.entries(projects).map(([alias, projectId]) => ({ value: projectId, name: `${alias} - ${projectId}` }));

    const project_selected = await select({
        message: "Select a Firebase project to switch to:",
        choices
    })

    LOGGER.box(project_selected, "Switching to project:");

    return project_selected;

}
module.exports.switchProject = switchProject;

/**
 * Retrieves the secret configuration files for a specified Firebase project.
 *
 * @param {string} projectId - The ID of the Firebase project for which to retrieve the secret files.
 * @returns {Object|undefined} The secret configuration object for the specified project, or undefined if the secrets folder or file does not exist.
 */
function getSecretsFiles(projectId){

    if(!fs.existsSync(FIREBASE_FILES_PATHS.secrets.folder)){
        console.log("\n");
        LOGGER.error("Cannot use Firebase without secrets.");
        console.log("\n");
        LOGGER.error(`First, create ${projectId}.json in root/scripts/secrets/firebase/`)
        console.log("\n");
        return undefined;
    }

    const secretFilePath = path.resolve(__dirname, FIREBASE_FILES_PATHS.secrets.folder, `${projectId}.json`)

    const secrets = readJson(secretFilePath)

    return secrets;

}
module.exports.getSecretsFiles = getSecretsFiles;

/**
 * Retrieves a list of hosting applications for a specified Firebase project.
 *
 * @param {string} projectId - The ID of the Firebase project for which to retrieve the hosting applications.
 * @returns {Array<Object>} An array of objects representing the hosting applications, each containing:
 *   - name: The name of the application.
 *   - defaultUrl: The default URL of the application.
 *   - shortUrl: A shortened version of the application's URL.
 *   - appId: The application ID.
 */
function getHostingApps(projectId){

    const apps = runCommand(FIREBASE_CMD.app.list(projectId));

    const appsInfo = apps.result.sites.map( app => {

        const appName = app.name.split("/").pop()
        const defaultUrlNoHttps = app.defaultUrl.split("https://")[1]
        const shortUrl = defaultUrlNoHttps.split(".web.app")[0]

        return {
            name: appName,
            defaultUrl: app.defaultUrl,
            shortUrl,
            appId: app.appId
        }

    })

    return appsInfo

}
module.exports.getHostingApps = getHostingApps;

/**
 * Prompts the user to select a hosting application from a list or finds a specific app by URL.
 *
 * @param {Array<Object>} apps - An array of hosting applications, each containing details like name, defaultUrl, shortUrl, and appId.
 * @param {string} [appUrl=undefined] - An optional URL to directly select a specific hosting app by its short URL.
 * @returns {Promise<Object|null>} The selected hosting application object, or null if no app is selected or found.
 */
async function selectHostingApp(apps, appUrl = undefined){

    let selectedApp = null;

    if(appUrl){
        selectedApp = apps.find( app => app.shortUrl === appUrl)
    } else {
        selectedApp = await select({
            message: "Select the hosting app",
            choices: apps.map( app => ({ value: app, name: app.shortUrl }))
        })

    }

    return selectedApp
}
module.exports.selectHostingApp = selectHostingApp

/**
 * Initializes the Firebase configuration for a specified project, setting up hosting and app initialization files.
 *
 * @param {string} projectId - The ID of the Firebase project to configure.
 * @param {Object} [options={}] - Optional settings for the initialization process.
 * @param {boolean} [options.local=false] - Indicates whether to localize configurations.
 * @param {string} [options.appUrl] - The URL of the app to directly select a specific hosting app.
 * @param {Object} [additionalParams={}] - Additional parameters for further customization.
 * @param {Object} [additionalParams.local] - Local configuration overrides.
 * @returns {Promise<void>} A promise that resolves when the initialization process is complete.
 */
async function init(projectId, options = {}, additionalParams = {}){

    LOGGER.box(projectId, "Configuring Firebase implentation for:")

    const newOptions = {
        "local": false,
        ...options
    }

    console.log("newOptions", newOptions)

    const initialConfigs = getSecretsFiles(projectId);

    if(!initialConfigs){
        LOGGER.error(`Initial configs are undefined. Check the project secrets file.`)
        return;
    }

    const apps = getHostingApps(projectId);

    const selectedApp = await selectHostingApp(apps, newOptions.appUrl);


    let newConfigs = {...initialConfigs}

    if(selectedApp){
        LOGGER.box(selectedApp.shortUrl, "Hosting App selected:")
        newConfigs.appId = selectedApp.appId
    }

    if(newOptions.local && additionalParams.local){
        LOGGER.box("Localizing configurations")
        newConfigs = await localizeConfigs(newConfigs, additionalParams.local)
    }

    const appFileContent = await initAppFile(projectId, newConfigs, newOptions.init)

    LOGGER.box(`${selectedApp.name} - ${selectedApp.shortUrl}`, "Creating Firebase App init file")

    writeFile(FIREBASE_FILES_PATHS.app.init, appFileContent)

    const firebaseSettings = readJson(FIREBASE_FILES_PATHS.configs.settings)

    const newFirebaseSettings = {
        ...firebaseSettings,
        "hosting": {
            ...firebaseSettings.hosting,
            site: selectedApp.shortUrl
        }
    }

    const prettiefiedSettings = await prettier.format(JSON.stringify(newFirebaseSettings), { parser: "json"})

    LOGGER.box(selectedApp.shortUrl, "Updating Firebase hosting target site")

    writeFile(FIREBASE_FILES_PATHS.configs.settings, prettiefiedSettings)

    LOGGER.box("Ready to run or deploy")
    return;
}
module.exports.init = init;