const { select } = require("@inquirer/prompts");
const { init, getCurrentProjectID, switchProject } = require("../utilities/firebase.cjs");
const LOGGER = require("../utilities/logger.cjs")

async function run(){

    const currentProject = getCurrentProjectID()

    LOGGER.box(currentProject, "Current Project")

    const isSwitch = await select({
        message: "Switch to another project?",
        choices: [
            {
                name: "No ( Keep the current )",
                value: false
            },
            {
                name: "Yes",
                value: true
            }
        ]

    })

    if(!isSwitch){
        await init(currentProject);
        return;
    } else {
        const newProject = await switchProject();
        await init(newProject);
        return;
    }

}

run();