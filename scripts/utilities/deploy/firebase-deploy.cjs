// FIREBASE DEPLOY LOGIC

// 1. Check actual firebase project - "firebase use"
// 2. check if there are other projects
// 2.1 confirm or change project
// 3. Next

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts");

const FIREBASE_DEFAULT_FILES = {
    "settings": ".firebaserc",
    "configs": "firebase.json"
}

function getFirebaseFiles(){

    let firebase_files_paths = {}

    Object
        .entries(FIREBASE_DEFAULT_FILES)
        .forEach( function ([ key, filename ]) {

            const file_path = path.resolve(filename)

            firebase_files_paths[key] = file_path

        })

    if(
        Object
            .keys(firebase_files_paths)
            .length === 0
    ) {
        throw new Error("Cannot get default firebase files paths")
    }

    // console.log("firebase files paths", firebase_files_paths)

    return firebase_files_paths
}

function readFirebaseFiles(firebaseFilePaths){

    let readed_files = {}

    Object
        .entries(firebaseFilePaths)
        .forEach( async function ([key, file_path]){

            const content = fs.readFileSync(file_path)

            const parsed_content = JSON.parse(content)

            readed_files[key] = parsed_content

        })

    // console.log("readed_files", readed_files)

    if(
        Object
            .keys(readed_files)
            .length === 0
    ){
        throw new Error("Cannot read firebase files")
    }

    const check_result = Object
        .values(readed_files)
        .reduce( function ( acc, value ) {

            if( typeof value !== "object" ) {
                return [ ...acc, false ]
            } else {
                if( 
                    Object
                        .keys(value)
                        .length === 0
                ){
                    return [ ...acc, false ]
                } else {
                    return [ ...acc, true ]
                }
            }

        }, [])
    
    // console.log("check result", check_result)
    
    if(
        check_result
            .filter( c => c === true )
            .lenght === 0
    ) {
        throw new Error("Read files went wrong")
    }
    
    return readed_files

}

function checkActiveFirebaseProject(){

    const firebase_use_cmd = execSync("firebase use", { encoding: "utf-8" })
    console.log("firebase_active_project", firebase_use_cmd)

    return firebase_use_cmd.toString()

}

function mergeFirebaseProjectsByName(firebaseProjects){
    let projects_array = []

    Object
        .entries(firebaseProjects)
        .forEach( function ( [alias, firebase_project_name] ) {

            // Check if there is ALREADY the firebase_project_name
            const find_firebase_project_name = projects_array
                .find( function ( fb ) {
                    return fb.name === firebase_project_name
                })
            
            if(
                find_firebase_project_name === undefined ||
                find_firebase_project_name === null
            ) {
                projects_array.push({
                    name: firebase_project_name,
                    aliases: [ alias ]
                })
            } else {

                const find_firebase_project_name_index = projects_array
                    .findIndex( function ( fb ) {
                        return fb.name === firebase_project_name
                    })
            
                let updated_aliases_in_firebase_project = {
                    name: find_firebase_project_name.name,
                    aliases: [ ...find_firebase_project_name.aliases, alias ]
                }

                projects_array.splice(find_firebase_project_name_index, 1)

                projects_array.push(updated_aliases_in_firebase_project)
            }

        })
    
    return projects_array
}

function getOtherFirebaseProjects(firebaseSettingsFile, activeFirebaseProject){

    const { projects } = firebaseSettingsFile

    const check_if_active_project_in_settings = Object
        .values(projects)
        .reduce( function ( acc, value ) {

            const normalizedValue = String(value).trim();
            const normalizedActiveProject = String(activeFirebaseProject).trim();

            // console.log(
            //     `Comparing: '${normalizedValue}' with '${normalizedActiveProject}'`,
            //     normalizedValue === normalizedActiveProject
            // );

            // console.log(`${value} ${activeFirebaseProject}`, String(value) === String(activeFirebaseProject) )
           
            if(normalizedValue !== normalizedActiveProject ) return [ ...acc, false ]
            else return [ ...acc, true ]

        }, [])
    
    // console.log(check_if_active_project_in_settings)
    
    if(
        check_if_active_project_in_settings
            .filter( function ( fb ) { return fb === true })
            .length === 0
    ) {
        throw new Error("Theres no projects as the active firebase project in firebase settings")
    }

    if(
        Object
            .keys(projects)
            .length === 1
    ){

        return [{
            name: projects[0],
            aliases: [ Object.keys(projects)[0] ]
        }]
    } else {

        if(
            Object
            .keys(projects)
            .length === 2
        ) {

            let projects_array = mergeFirebaseProjectsByName(projects)
            return projects_array
        } else {
            let projects_array = mergeFirebaseProjectsByName(projects)
                
            return projects_array
        }

    }

}


async function firebaseDeployTarget(){

    // Check firebase active project
    const firebase_active_project = checkActiveFirebaseProject()

    // Check if there are other firebase projects inits
    // 1.
    const firebase_files_paths = getFirebaseFiles()

    // 2.
    const firebase_files = readFirebaseFiles(firebase_files_paths)
    const { settings } = firebase_files
    const is_other_firebase_projects = getOtherFirebaseProjects(settings, firebase_active_project)

    if(
        is_other_firebase_projects.length === 1
    ){
        const firebase_project_name = is_other_firebase_projects[0].name
        const firebase_project_alias = is_other_firebase_projects[0].aliases[0]
        // ONLY ONE PROJECT AS THE ACTIVE FIREBASEPROJECT --> RUN DEPLOY
        // console.log("Firebase target cmd", `firebase target:apply hosting ${firebase_project_alias} ${firebase_project_name}`)

        execSync(`firebase target:apply hosting ${firebase_project_alias} ${firebase_project_name}`, { stdio: "inherit"})

    } else {
        // ASK IF CHANGE THE PROJECT
        const ask_if_change_project = await select({
            message: "Would you like to change firebase project?",
            choices: [
                {
                    name: "yes",
                    value: "yes",
                    description: "You will be asked to select one of the other projects if multiple, otherwise directly deploy in the other project"
                },
                {
                    name: "no",
                    value: "no",
                    description: "Deploy in current active firebase project"
                },
            ]
        })

        if( ask_if_change_project === "no"){

            const find_active_firebase_project_info = is_other_firebase_projects
                .find( function ( fb ) {
                    fb.name === firebase_active_project
                })

            // console.log("firebase target cmd", `firebase target:apply hosting ${find_active_firebase_project_info.aliases[0]} ${find_active_firebase_project_info.name}`)
            execSync(`firebase target:apply hosting ${find_active_firebase_project_info.aliases[0]} ${find_active_firebase_project_info.name}`, { stdio: "inherit"})
            
        } else {
            const other_firebase_projects = is_other_firebase_projects
                .filter( function ( fb ) {
                    return String(fb.name).trim() !== String(firebase_active_project).trim()
                })
            
            if( other_firebase_projects.length === 1 ){

                const firebase_project_name = other_firebase_projects[0].name
                const firebase_project_alias = other_firebase_projects[0].aliases[0]

                // console.log("firebase target cmd", `firebase target:apply hosting ${firebase_project_alias} ${firebase_project_name}`)
                execSync(`firebase target:apply hosting ${firebase_project_alias} ${firebase_project_name}`, { stdio: "inherit"})

            } else {

                const ask_which_project_to_deploy = await select({
                    message: "Choose the other project to deploy to",
                    choices: other_firebase_projects
                        .map( function ( fb ) {

                            return {
                                name: fb.name,
                                value: `${fb.aliases[0]} ${fb.name}`,
                                description: `${fb.name} aliases: ${fb.aliases}`
                            }

                        })
                })

                // console.log("firebase target cmd", `firebase target:apply hosting ${ask_which_project_to_deploy}`)
                execSync(`firebase target:apply hosting ${ask_which_project_to_deploy}`, { stdio: "inherit"})

            }
        }

    }

}

firebaseDeployTarget()