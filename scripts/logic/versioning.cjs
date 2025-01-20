const { versionScript } = require("../utilities/versioning/index.cjs")
const { updateGitTag, getFileChanges, selectBranch } = require("../utilities/versioning/git.cjs")
const { updatePackageJson } = require("../utilities/versioning/project.cjs")
const { updateInAppVersion } = require("../utilities/versioning/in-app.cjs")
const { execSync } = require("child_process")
const { select } = require("@inquirer/prompts")

async function runVersion(){

    const {version, targets} = await versionScript()

    const cmds_by_target = {
        "package.json": updatePackageJson,
        "in-app": updateInAppVersion,
        "git": updateGitTag
    }

    const file_changes_by_target = {
        "package.json": "package.json",
        "in-app": "src/version.json",

    }

    
    const ask_which_branch = await selectBranch()

    const changes = getFileChanges()
    // console.log(changes)

    if(changes.length > 0){
        console.log("There still are some file changes NOT committed", changes)

        const ask_about_changes = await select({
            message: "Commit or ignore?",
            choices: [
                {
                    name: "I want to commit them first",
                    value: "commit",
                    description: "You will have to manually commit changes"
                },
                {
                    name: "Ignore them",
                    value: "ignore",
                    description: ""
                },
            ]
        })

        if(ask_about_changes === "commit"){
            return
        }
    }
    
    for (let i = 0; i < targets.length; i++) {
        
        let current_target = targets[i]
        
        if(current_target !== "git"){
            
            await cmds_by_target[current_target](version)
            
            console.log(`FILE TO ADD ${file_changes_by_target[current_target]}`)
            console.log(`git add ${file_changes_by_target[current_target]}`)
            execSync(`git add ${file_changes_by_target[current_target]}`)
            // console.log(`git commit -m versioning: Updated to version ${version}`)
            execSync(`git commit -m "versioning: Updated to version ${version}"`)
            // console.log(`git push -u origin ${ask_which_branch}`)
            execSync(`git push -u origin ${ask_which_branch}`)

        } else {

            await cmds_by_target[current_target](version)
            console.log(`git push -u origin --tags`)
            execSync(`git push -u origin --tags`)

        }
        
    }

    console.log(`Version updated to: ${version}`)

}

runVersion()