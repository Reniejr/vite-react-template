const GIT = require("./git.cjs");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const moment = require("moment");

function getVersionParameters(version){

    let parsedActualVersion = {
        "major": parseInt(version.split(".")[0]),
        "minor": parseInt(version.split(".")[1]),
        "fix": parseInt(version.split(".")[2])
    }
    return parsedActualVersion
}

module.exports.getVersionParameters = getVersionParameters

function updateVersionByType(versionParametered, versionType){

    let newVersion = {
        ...versionParametered
    }

    switch (versionType) {
        case "major":
            newVersion.major += 1
            newVersion.minor = 0
            newVersion.fix = 0
            break;
        case "minor":
            newVersion.minor += 1
            newVersion.fix = 0
            break;
        case "fix":
            newVersion.fix += 1
            break;
        default:
            newVersion.fix += 1
            break;
    }
    const newVersionText = Object.values(newVersion).join(".")
    return {
        parameters: newVersion,
        text: newVersionText
    }

}

module.exports.updateVersionByType = updateVersionByType

async function updatePackageJsonVersion(newVersionPassed = undefined, versionType){

    console.log(newVersionPassed)

    const packageJsonPath = path.resolve(__dirname, "../../package.json")

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))

    if(newVersionPassed){

        let newPackageJson = {
            ...packageJson
        }
    
        newPackageJson.version = newVersionPassed
    
        const prettifiedVersion = await prettier.format(JSON.stringify(newPackageJson), { parser: "json"})

        console.log(prettifiedVersion)
    
        fs.writeFileSync(packageJsonPath, prettifiedVersion)
    
        return;
    } else {
        const { version } = packageJson
    
        let parsedActualVersion = getVersionParameters(version)
    
        const newVersion = updateVersionByType(parsedActualVersion, versionType)
        
        let newPackageJson = {
            ...packageJson
        }
    
        newPackageJson.version = newVersion.text
    
        const prettifiedVersion = await prettier.format(JSON.stringify(newPackageJson), { parser: "json"})
    
        fs.writeFileSync(packageJsonPath, prettifiedVersion)
        return 
    }


}

module.exports.updatePackageJsonVersion = updatePackageJsonVersion

async function updateInprogressFile(withHistory = true){

    const inprogressFilePath = path.resolve(__dirname, "../temp/in_progress.json")

    const inProgressFile = JSON.parse(fs.readFileSync(inprogressFilePath))

    const history = GIT.listHistory()

    if(history.length === 0) return;

    const history_no_test = history.filter( commit => commit.type !== "test" && commit.type !== "log")

    let newInprogress = {
        ...inProgressFile
    }

    newInprogress.last = history[0].hash
    if(withHistory === true){
        newInprogress.history = [ ...history_no_test, ...newInprogress.history ]
    } else {
        newInprogress.history = []
    }

    const prettifiedVersion = await prettier.format(JSON.stringify(newInprogress), { parser: "json"})

    fs.writeFileSync(inprogressFilePath, prettifiedVersion)

}

module.exports.updateInProgressFile = updateInprogressFile

async function updateChangeLog(newVersion = undefined){

    const changeLogPath = path.resolve(__dirname, "../../CHANGELOG.md")

    const changeLog = fs.readFileSync(changeLogPath, { encoding: "utf-8"})

    const inProgressPath = path.resolve(__dirname, "../temp/in_progress.json")

    const inProgress = JSON.parse(fs.readFileSync(inProgressPath))

    const historyText = inProgress.history.map( commit => {

        let changeText = "- "

        switch (commit.type) {
            case "feat":
                changeText += `[Added] ${commit.message}`
                break;
            case "dev":
                changeText += `[Internal] ${commit.message}`
                break;
            case "code":
                changeText += `[Refactor] ${commit.message}`
                break;
            case "fix":
                changeText += `[Fixed] ${commit.message}`
                break;
            case "edit":
                changeText += `[Changed] ${commit.message}`
                break;
            case "deprecate":
                changeText += `[Deprecated] ${commit.message}`
                break;
            case "remove":
                changeText += `[Removed] ${commit.message}`
                break;
            default:
                changeText += `[Fixed] ${commit.message}`
                break;
        }

        return changeText

    })

    const inProgressState = newVersion === undefined ? `## Unreleased - ${moment().format("YYYY MMMM DD")}` : `## [${newVersion}] - ${moment().format("YYYY MMMM DD")}`
    
    let newInprogress

    if(historyText.length > 0 && historyText[0] !== ""){

        const oldUnreleasedCommits = getUnreleasedLogs(changeLog)

        if(oldUnreleasedCommits.unreleased !== ""){

        newInprogress = `${inProgressState}
${historyText.join("\n")}
${oldUnreleasedCommits.unreleased}

${oldUnreleasedCommits.rest}`

        } else {
        newInprogress = `${inProgressState}
${historyText.join("\n")}

${changeLog}`
        }

    } else {
        newInprogress = `${changeLog}`
    }

    // console.log(newInprogress)
    fs.writeFileSync(changeLogPath, newInprogress)

}

module.exports.updateChangeLog = updateChangeLog

function getUnreleasedLogs(changelog) {
    const lines = changelog.split('\n');
    let unreleasedLogs = [];
    let restOfFile = [];
    let isUnreleased = false;

    for (let line of lines) {
        if (/^## Unreleased - \d{4} \w+ \d{1,2}/.test(line)) {
            isUnreleased = true;
            continue;
        }
        if (/^## \[\d+\.\d+\.\d+\]/.test(line)) {
            isUnreleased = false;
        }
        if (isUnreleased) {
            unreleasedLogs.push(line);
        } else {
            restOfFile.push(line);
        }
    }

    return {
        unreleased: unreleasedLogs.join('\n'),
        rest: restOfFile.join('\n')
    };
}