// 1. select deploy method - [ firebase ]
// 2. check .env vars ( IF NEEDED )
// 2.1 Update .env
// 3. Build
// 4. ask if new version
// 4.1 update version
// 5. git update + git tag ( if new version )
// 6. deploy

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { select } = require("@inquirer/prompts");

const DEPLOY_CMDS_BY_NAME = {
    "firebase": {
        utilities: ["node scripts/utilities/deploy/firebase-deploy.cjs"],
        deploy: "firebase deploy --only hosting"
    }
}

async function selectDeployMethod(){

    const ask_deploy_method = await select({
        message: "Which deploy method to use?",
        choices: [
            {
                name: "firebase",
                value: "firebase",
                description: "Firebase deploy ( You will be asked to confirm the firebase project )"
            }
        ]
    })
    
    if(
        DEPLOY_CMDS_BY_NAME[ask_deploy_method].utilities.length > 0
    ) {
        for (let i = 0; i < DEPLOY_CMDS_BY_NAME[ask_deploy_method].utilities.length; i++) {
            execSync(DEPLOY_CMDS_BY_NAME[ask_deploy_method].utilities[i])
        }
    }


    return ask_deploy_method

}

async function deploy(){



}
