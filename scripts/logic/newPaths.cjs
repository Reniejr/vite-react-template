const { updateVitePaths } = require("../utilities/codebase.cjs");
const { navigateAndSelectFolders } = require("../utilities/index.cjs");
const { input } = require("@inquirer/prompts");
const { readVitePaths } = require("../utilities/codebase.cjs");
const LOGGER = require("../utilities/logger.cjs");


async function run(){

    const newPaths = await navigateAndSelectFolders();

    const declaredPaths = readVitePaths() 

    const filteredPaths = newPaths.filter( folderPath => !Object.values(declaredPaths).includes(`/${folderPath.replaceAll("\\", "/")}`))

    const newPathsDetails = await Promise.all(
        filteredPaths.map( async function(folderPath){

            const aliasPath = await input({ message: `Type the alias for the folder: ${folderPath}`})

            return {
                alias: aliasPath,
                path: `/${folderPath.replaceAll("\\", "/")}`
            }

        })
    )

    await updateVitePaths(newPathsDetails)

    LOGGER.box(`Added new alias paths`)

    return;


}

run()