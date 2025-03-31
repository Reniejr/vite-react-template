const { 
    FIREBASE_FILES_PATHS,
    getHostingApps,
    selectHostingApp
} = require("../utilities/firebase.cjs");
const LOGGER = require("../utilities/logger.cjs");
const { readJson, writeFile } = require("../utilities/index.cjs");
const { input, select } = require("@inquirer/prompts");
const { scriptFile, scriptFileLocal } = require("../templates/firebase.cjs");
const { updatePackageJson } = require("../utilities/codebase.cjs");
const path = require("path");


async function run(){

    const rc = readJson(FIREBASE_FILES_PATHS.configs.rc);

    if(
        !rc || 
        rc === undefined || 
        Object.keys(rc).length === 0 ||
        rc.projects === null ||
        rc.projects === undefined ||
        Object.keys(rc.projects).length === 0
    ){

        LOGGER.error("There's no any Firebase project initialized, run firebase init");

    }

    const { projects } = rc;

    // WRITE SCRIPT FILE PER PROJECTS EXCEPT DEFAULT
    const projectsList = Object.entries(projects)
        .filter(function ([alias, projectName]) {
            return alias !== "default"
        })
        .map(function([ alias, projectName]){
            return {
                env: alias,
                name: projectName
            }
        })

    let perHostingApp = []

    for (let i = 0; i < projectsList.length; i++) {
        let project = projectsList[i];

        LOGGER.box(`${project.name} - ${project.env}`, "Selecting Hosting App for:")

        let hostingAppsProject = getHostingApps(project.name);
    
        let selected_app = await selectHostingApp(hostingAppsProject);

        let scriptNameAlias = await input({message: "How to name the script?"})

        let firebaseScriptOptions = {
            scriptName: scriptNameAlias,
            env: project.env,
            projectId: project.name,
            hostingApp: selected_app
        }

        perHostingApp.push(firebaseScriptOptions)

        let localize = await select({
            message: "Initialize it with local server too?",
            choices: [
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

        if(localize === true){

            const RTDB_PORT = await input({ message: "Which port run the realtime DB?"})

            firebaseScriptOptions = {
                ...firebaseScriptOptions,
                local: {
                    rtdb: RTDB_PORT
                }
            }

            perHostingApp.push(firebaseScriptOptions)

        }


    }

    // for each perHostingApp configs, create the script file
    const scriptFilesPaths = await Promise.all(
        perHostingApp.map( async function (project){

            if(project.hasOwnProperty("local")){

                const scriptContent = await scriptFileLocal(project);
    
                const scriptPath = `run-${project.scriptName}-${project.env}-with-local-firebase.cjs`
    
                const scriptFilePath = path.resolve(__dirname, `./${scriptPath}`)
    
                writeFile(scriptFilePath, scriptContent)
    
                return {
                    path: scriptPath,
                    scriptName: `${project.scriptName}:${project.env}:local`
                }

            } else {
                
                const scriptContent = await scriptFile(project);
    
                const scriptPath = `run-${project.scriptName}-${project.env}-with-firebase.cjs`
    
                const scriptFilePath = path.resolve(__dirname, `./${scriptPath}`)
    
                writeFile(scriptFilePath, scriptContent)
    
                return {
                    path: scriptPath,
                    scriptName: `${project.scriptName}:${project.env}`
                }

            }
    
        })
    )

    // for each script file write the additional script in package.json

    let newPackageJsonScripts = {};

    scriptFilesPaths.forEach( function(scriptInfo){

        newPackageJsonScripts[`${scriptInfo.scriptName}`] = `node ./scripts/logic/${scriptInfo.path}`
    })

    await updatePackageJson(newPackageJsonScripts, "scripts")

}

run()