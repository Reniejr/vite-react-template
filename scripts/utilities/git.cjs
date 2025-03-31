const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const COMMANDS = {
    "branch": {
        "get": "git branch --show-current",
        "list": "git branch",
        "latest": "git fetch && git pull"
    },
    "commits": {
        "last": "",
        "last-history": (lastPushHash) => `git log --oneline ${lastPushHash}..HEAD`
    },
    "log": {
        "last-push": 'git reflog show --date=iso --grep="push" -n 1'
    },
    "tag": {
        "list": "git tag --list"
    }
}

module.exports.COMMANDS = COMMANDS

function getLastTag(){
    const tags = execSync(COMMANDS.tag.list, { encoding: "utf-8"}).trim().split("\n")
    
    const lastTag = tags[tags.length - 1]

    return lastTag
}

module.exports.getLastTag = getLastTag

function listHistory(){

    const inProgressFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../temp/in_progress.json")))


    const latest_commits = execSync(COMMANDS.commits["last-history"](inProgressFile.last), { encoding: "utf-8"}).trim().split("\n")

    if(latest_commits.length === 0 || (latest_commits.length === 1 && latest_commits[0] === "")) return []

    const formatted_commits = latest_commits.map( commit => {

        // console.log(commit)

        const hash = commit.split(" ")[0]
        const type = commit.split(" ")[1].startsWith("Merge") ? "merge" : commit.split(" ")[1].split(":")[0]
        const message = commit.split(" ")[1].startsWith("Merge") ? commit.split(" ")[1] : commit.split(":")[1]
        
        return {
            hash,
            type,
            message: message.startsWith(" ") ? message.substring(1) : message
        }

    })

    return formatted_commits

}

module.exports.listHistory = listHistory