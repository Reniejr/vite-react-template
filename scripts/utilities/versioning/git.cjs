// # GIT VERSIONING SCRIPTS
const { execSync } = require("child_process");
const { select, input } = require("@inquirer/prompts");

const { getLastGitTag } = require("./index.cjs")

function getGitTags(){
    const tags = execSync('git tag -l', { encoding: "utf-8"})
    const array_tags = tags.split("\n").filter( t => t !== "")
    return array_tags
}

function gitTagAndPush(version, tag = undefined){

    if(tag === undefined || tag === null || tag === ""){
        // console.log(`git tag ${version}`)
        // console.log(`git push origin --tags`)
        execSync(`git tag ${version}`)
        execSync(`git push origin --tags`)
        
    } else {
        // console.log(`git tag -f ${tag}`)
        // console.log(`git push --force origin ${tag}`)
        execSync(`git tag -f ${tag}`)
        execSync(`git push --force origin ${tag}`)
    }

}

function updateLastTag(){
    const last_tag = getLastGitTag()
    return gitTagAndPush(null, last_tag)
}

function createTag(version){
    return gitTagAndPush(version)
}

async function updateTagByID(){

    const tags = getGitTags()

    const ask_which_tag = await select({
        message: "Which tag to update?",
        choices: tags.map( t => {
            return {
                name: t,
                value: t,
                description: `Git tag: ${t}`
            }
        })
    })

    return gitTagAndPush(null, ask_which_tag)
}

async function updateGitTag(newVersion){

    const ask_method_to_update = await select({
        message: "Type of git Tag update",
        choices: [
            {
                name: "Update last version",
                value: "last-tag"
            },
            {
                name: "New Tag",
                value: "new"
            },
            {
                name: "Tag ID",
                value: "tag-id"
            }

        ]
    })

    const cmds_by_value = {
        "last-tag": updateLastTag,
        "new": createTag,
        "tag-id": updateTagByID
    }

    return await cmds_by_value[ask_method_to_update](newVersion)

}

function getFileChanges(){

    const modified_files_output = execSync("git diff --name-only", { encoding: "utf-8"})
    const modified_files = modified_files_output.trim().split("\n")

    const untracked_files_output = execSync("git ls-files --others --exclude-standard", { encoding: "utf-8"})
    const untracked_files = untracked_files_output.trim().split("\n")

    return [].concat(modified_files).concat(untracked_files).filter( f => f !== "")

}

function getBranchList(){

    const branch_list_output = execSync("git branch --list", { encoding: "utf-8"})
    const branch_list = branch_list_output.trim().split("\n")

    const branch_list_names = branch_list.map( b => b.replaceAll("* ", "").replaceAll(" ", ""))

    return branch_list_names

}

async function selectBranch(){

    const ask_which_branch = await select({
        message: "Which branch?",
        choices: [
            {
                "name": "Select existed branch",
                "value": "branch-list",
                "description": "You will have to select from the branch list"
            },
            {
                "name": "New branch",
                "value": "new-branch",
                "description": "You will have to set a new branch"
            },
        ]
    })

    let branch

    if(ask_which_branch === "branch-list"){

        const branch_list = getBranchList()

        const ask_which_branch = await select({
            message: "Branch list",
            choices: branch_list.map( b => ({ name: b, value: b, }))
        })

        branch = ask_which_branch
        execSync(`git switch ${ask_which_branch}`)

    }
    if( ask_which_branch === "new-branch"){

        const new_branch_name = await input({ message: "Enter the name of the branch" })
        branch = new_branch_name

        console.log(`git switch -c ${new_branch_name}`)
        execSync(`git switch -c ${new_branch_name}`)
    }

    return branch
}

module.exports = { updateGitTag, getFileChanges, selectBranch }