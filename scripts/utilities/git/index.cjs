const { execSync } = require("child_process");
const { input, select } = require("@inquirer/prompts")
const multiselect = require("inquirer-select-pro")
const { selectBranch } = require("../versioning/git.cjs")

const CMD_MODIFIED_FILES = `git diff --name-only`;
const CMD_UNTRACKED_FILES = `git ls-files --others --exclude-standard`;


const CONVENTIONAL_COMMITS_TYPES = [
    "fix",
    "feat",
    "docs",
    "build",
    "chore",
    "style",
    "refactor",
    "test"
]

function getFileChanges(){

    try {
        const modifiedFiles = execSync(CMD_MODIFIED_FILES).toString().split("\n");
        const untrackedFiles = execSync(CMD_UNTRACKED_FILES).toString().split("\n");

        return [].concat(modifiedFiles, untrackedFiles).filter( f => f !== "");

    } catch (error) {
        console.error(error);
        return [];
    }

}

async function groupChangesByScope(changes){

    let groups = []
    
    let remaining_changes = [ ...changes ]

    while(remaining_changes.length > 0){

        const select_changes = await multiselect.select({
            message: "Select the file changes to group",
            options: remaining_changes.map( c => ({ name: c, value: c }))
        })

        const define_scope = await input({ message: "Define the scope of the group"})

        let new_group

        const is_scope_already = groups.find( cG => cG.scope === define_scope )

        const commit_type = await select({
            message: "Select the type of the commit",
            choices: CONVENTIONAL_COMMITS_TYPES.map( cT => ({ name: cT, value: cT }))
        })

        const commit_description = await input({ message: "Briefly description of the commit" })

        const is_committed_already = groups.find( cG => cG.commitType === commit_type && cG.commitDescription === commit_description)

        if(
            ( 
                is_scope_already === null ||
                is_scope_already === undefined 
            ) ||
            (
                is_committed_already === null ||
                is_committed_already === undefined
            )
        ){

            const is_breaking_change = await select({
                message: "Is it a BREAKING CHANGES",
                choices: [
                    {
                        name: "no",
                        value: false
                    },
                    {
                        name: "Yes ( It is BREAKING CHANGES )",
                        value: true
                    }
                ]
            })

            let details = []
            let new_details = null

            
            while(new_details === null){
                const commit_details = await input({ message: "Insert a detail"}) 

                if(commit_details === ""){
                    new_details = null
                    break;
                } else {
                    details.push(commit_details)
                }

            }

            new_group = {
                scope: define_scope,
                commitType: commit_type,
                commitDescription: commit_description,
                files: select_changes,
                details: details,
                isBreaking: is_breaking_change
            }
            groups.push(new_group)
            remaining_changes = remaining_changes.filter( el => !select_changes.includes(el))

        } else {
            new_group = {
                ...is_scope_already
            }

            new_group.files = new_group.files.concat(select_changes)
            let details = []
            let new_details = null

            
            while(new_details === null){
                const commit_details = await input({ message: "Insert a detail"}) 

                if(commit_details === ""){
                    new_details = null
                    break;
                } else {
                    details.push(commit_details)
                }

            }

            new_group.details = new_group.details.concat(details)

            groups = groups.filter(cG => cG.scope !== define_scope)
            groups.push(new_group)
            remaining_changes = remaining_changes.filter( el => !select_changes.includes(el))
            
        }

    }

    return groups
}

async function groupGitCommit(){
    const changes = getFileChanges();

    const group_changes = await groupChangesByScope(changes)

    const branch = await selectBranch()

    group_changes.forEach( cG => {

        const commit_message = `${cG.commitType}${cG.scope !== "" ? `(${cG.scope})` : ""}${cG.isBreaking ? "!" : ""}: ${cG.commitDescription}${cG.details.length > 0 ? `
            
${cG.details.map( d => `${d}`).join(",").replaceAll(",", "\n")}
`: ""}`
        
        // console.log(`git add ${cG.files.map( f => f).join(" ")}`)
        // console.log(`git commit -m "${commit_message}"`)
        // console.log(`git push -u origin ${branch}`)
        execSync(`git add ${cG.files.map( f => f).join(" ")}`)
        execSync(`git commit -m "${commit_message}"`)
        execSync(`git push -u origin ${branch}`)

    })
}

module.exports = { groupGitCommit }