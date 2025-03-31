const {
    switchProject,
    getActualProjectID,
    initAdminApp
} = require("../utilities/firebase.cjs");

const { select } = require("@inquirer/prompts");

const { execSync } = require("child_process");

/**
 * This function is responsible for running the local server and managing Firebase project switching.
 * It first retrieves the current Firebase project ID, then prompts the user to switch to another project.
 * If the user decides to switch, it uses the `switchProject` function to get the new project ID,
 * updates the Firebase project using the `firebase use` command, and initializes the admin app with the new project ID.
 * If the user chooses not to switch, it initializes the admin app with the current project ID.
 *
 * @returns {Promise<void>} - The function does not return any value.
 */
async function runServer(){

    const actual_project_id = getActualProjectID();

    console.log(`Current Firebase Project: ${actual_project_id}`);

    const is_switch_project = await select({
        message: "Do you want to switch to another Firebase Project?",
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

    if(!is_switch_project){
        initAdminApp(actual_project_id);
    } else {
        const switched_project_id = await switchProject();
        execSync(`firebase use ${switched_project_id}`);
        console.log(`Firebase using ${switched_project_id}`)
        initAdminApp(switched_project_id);
    }

}


runServer();