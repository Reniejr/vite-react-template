const { execSync } = require("child_process");
const multiSelect = require("inquirer-select-pro")
const { select } = require("@inquirer/prompts");
const fs = require("fs");
const path = require("path");

// Templates
const { firebase_template_initializeApps } = require("../../templates/firebase.cjs")

// Commands
const FIREBASE_CMDS = {
    "init": "firebase init hosting",
    "add": "firebase use --add",
    "get_configs": function(projectId, appId = undefined ){ return `firebase apps:sdkconfig WEB --project ${projectId}${appId !== undefined && appId !== "" ? ` ${appId}` : ""} --json`},
    "get_projects_app": function(projectId) { return `firebase apps:list --project ${projectId} --json`}
}

/**
 *
 */
async function firebase_getProjectsAppNames(){

    const firebaserc_content = fs.readFileSync(".firebaserc", { encoding: "utf-8" });
    
    if(
        firebaserc_content === undefined ||
        firebaserc_content === null ||
        firebaserc_content === ""
    ){
        throw new Error("Cannot retrieve .firebaserc content. Check if file exist")
    }
    
    const parsed_firebaserc_content = JSON.parse(firebaserc_content);
    if(
        parsed_firebaserc_content === undefined ||
        parsed_firebaserc_content === null ||
        typeof parsed_firebaserc_content !== "object" ||
        Array.isArray(parsed_firebaserc_content) ||
        Object.keys(parsed_firebaserc_content).length === 0 ||
        !parsed_firebaserc_content.hasOwnProperty("projects")
    ){
        throw new Error("There's no firebase projects initialized")
    }

    const { projects } = parsed_firebaserc_content;

    return projects

}


/**
 *
 */
async function firebase_getProjectList(){

    const projects_list = execSync("firebase projects:list --json")
    const parsed_projects_list = JSON.parse(projects_list)

    const list = parsed_projects_list.result.map(( p ) => {
        const { projectId, displayName } = p;
        return { projectId, displayName }
    })

    return list;

}

/**
 *
 * @param projectsList
 */
async function firebase_getProjectsConfigs(projectsList = []){


    let project_ids = projectsList

    if(projectsList.length === 0 || Object.keys(projectsList).length === 0){

        const all_projects = await firebase_getProjectList()

        const ask_which_projects_to_take = await multiSelect.select({
            message: "Which projects wants to take?",
            options: all_projects.map( p => ({ name: `${p.displayName} - ID : ${p.projectId}`, value: p.projectId }))
        })

        project_ids = ask_which_projects_to_take
    } else {
        project_ids = [ ...new Set(Object.values(projectsList))]
    }

    const result = []

    for (let i = 0; i < project_ids.length; i++) {

        const projectId = project_ids[i]

        const apps_command = FIREBASE_CMDS.get_projects_app(projectId)

        const apps_list = execSync(apps_command, { encoding: "utf-8" });
        const parsed_apps_list = JSON.parse(apps_list).result.map( app => {
            const { displayName, appId } = app;
            return { displayName, appId }
        })

        if(parsed_apps_list.length === 0){
            console.log(`${projectId} does NOT have web apps or cannot retrieve them. Skipping`)
            return
        }

        const ask_which_apps_to_get = await multiSelect.select({
            message: "Which app do you want to get?",
            options: parsed_apps_list.map( app => ({ name: app.displayName, value: app.appId }))
        })

        for (let x = 0; x < ask_which_apps_to_get.length; x++) {

            const appId = ask_which_apps_to_get[x]
            
            const configs_command = FIREBASE_CMDS.get_configs(projectId, appId)
    
            const configs_file = execSync(configs_command, { encoding: "utf-8"} )
            const parsed_configs_file_content = JSON.parse(configs_file).result.sdkConfig
    
    
            result.push(parsed_configs_file_content)
        }
        
    }

    return result;
}

/**
 *
 * @param projects
 * @param projectsConfigsList
 */
async function firebase_generateProjectsInfo(projects, projectsConfigsList){

    const result = []

    Object.entries( projects ).forEach( ([ projectAlias, projectName ]) =>{

        const new_info = {
            alias: projectAlias,
            name: projectName,
            configs: {}
        }

        const find_matched_configs_file = projectsConfigsList.find( projectConfig => projectConfig.projectId === projectName );

        if(
            find_matched_configs_file === undefined ||
            find_matched_configs_file === null
        ) {
            console.log(`Cannot find configs file for: ${projectAlias} - ${projectName}.\nSkipping...`)
            return;
        }

        new_info["configs"] = find_matched_configs_file

        result.push(new_info)
        
    })
    
    return result;

}

/**
 *
 */
async function firebase_getProjectsAppsConfigs(){

    const firebase_projects_initialized = await firebase_getProjectsAppNames();

    const firebase_projects_configs = await firebase_getProjectsConfigs(firebase_projects_initialized)

    const projects_infos = await firebase_generateProjectsInfo(firebase_projects_initialized, firebase_projects_configs);

    return projects_infos

}

/**
 *
 */
async function firebase_writeAppInitFile(){

    const projects_infos = await firebase_getProjectsAppsConfigs();

    const path_to_write = `./src/services/firebase/config.js`

    if(!fs.existsSync(path_to_write)){

        const full_path = path.resolve("src/services/firebase")

        fs.mkdirSync(full_path, { recursive: true })

    }

    const app_initialized_content = firebase_template_initializeApps(projects_infos);

    fs.writeFileSync(path_to_write, app_initialized_content)
}

/**
 *
 */
async function firebase_setup(){

    if(!fs.existsSync(".firebaserc")){
        execSync(FIREBASE_CMDS.init, { stdio: "inherit" } )
    }

    let adding_projects = true;

    while(adding_projects){

        const ask_if_add_other_projects = await select({
            message: "Want to add other projects?",
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

        if(ask_if_add_other_projects){
            execSync(FIREBASE_CMDS.add, { stdio: "inherit" })
        } else {
            adding_projects = false;
            break;
        }

    }

    console.log("Firebase apps initialized.")
    // console.log("Before continue with firebase apps initialization setup.")
    // console.log("Create firebase configs files in './src/services/firebase' directory")
    // console.log("Firebase configs files names MUST be .json files AND MUST match firebase project name.")

    await firebase_writeAppInitFile()

}

module.exports = { firebase_writeAppInitFile, firebase_setup }