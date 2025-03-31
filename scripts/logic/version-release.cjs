const GIT = require("../utilities/git.cjs");
const { select } = require("@inquirer/prompts");
const { execSync } = require("child_process");
const {
    updateInProgressFile,
    getVersionParameters,
    updateVersionByType,
    updatePackageJsonVersion,
    updateChangeLog
} = require("../utilities/versioning.cjs");

async function version(){

    const lastTag = GIT.getLastTag()

    const currentBranch = execSync(GIT.COMMANDS.branch.get, { encoding: "utf-8"})
    // console.log("Current branch", currentBranch)

    const versionType = await select({
        message: "What type of version is?",
        choices: [
            {
                name: "Major",
                value: "major"
            },
            {
                name: "Minor",
                value: "minor"
            },
            {
                name: "Fix",
                value: "fix"
            },
            {
                name: "Unreleased",
                value: "unreleased"
            },
        ]
    })

    const versionParameter = getVersionParameters(lastTag.split("v")[1])

    let newVersion = null

    if(versionType !== "unreleased"){
        newVersion = updateVersionByType(versionParameter, versionType)
    }

    console.log(`
-----------------------------------------------
|                                             |
|     New Version : ${versionType === "unreleased" ? "Unreleased" : newVersion.text}        |
|                                             |
-----------------------------------------------
`)

    await updateInProgressFile(true)
    await updateChangeLog(versionType === "unreleased" ? undefined : newVersion.text)

    execSync(`git add .`)
    execSync(`git commit -m "log: changelog updates"`)
    execSync(`git push -u origin ${currentBranch}`, { stdio: "inherit"})

    console.log(`
-----------------------------------------------
|                                             |
|            Changelog updated                |
|                                             |
-----------------------------------------------
`)

    if(versionType !== "unreleased"){
        await updatePackageJsonVersion(newVersion.text, versionType)
            .then(() => {
                execSync(`git add .`)
                execSync(`git commit -m "log: package.json updates"`)
                execSync(`git push -u origin ${currentBranch}`, { stdio: "inherit"})
            })
    
    
        console.log(`
-----------------------------------------------
|                                             |
|            Package.json updated             |
|                                             |
-----------------------------------------------
`)
}

    
    await updateInProgressFile(false)

    execSync(`git add .`)
    execSync(`git commit -m "log: reset inProgress File"`)
    execSync(`git push -u origin ${currentBranch}`, { stdio: "inherit"})

    console.log(`
-----------------------------------------------
|                                             |
|         In progress file resetted           |
|                                             |
-----------------------------------------------
`)

    if(versionType !== "unreleased"){
        execSync(`git tag v${newVersion.text}`)
        execSync(`git push -u origin --tags`, { stdio: "inherit"})
    
        console.log(`
-----------------------------------------------
|                                             |
|   New version released ${newVersion.text}   |
|                                             |
-----------------------------------------------
`)
    }


    return;
}

version()