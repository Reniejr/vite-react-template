const prettier = require("prettier");

/**
 * Generates the basic setup for a Firebase application.
 *
 * @param {string} projectId - The unique identifier for the Firebase project.
 * @param {Object} configs - The configuration object for Firebase, containing keys and settings.
 * @returns {Object} An object containing the Firebase app initialization code, including dependencies, constants, and export statement.
 */
function basicApp(projectId, configs){
    const dependencies = `import { initializeApp } from "firebase/app";`
    const constants = `const firebaseConfig = ${JSON.stringify(configs)};

const APP = initializeApp(firebaseConfig, "${projectId}")`
    const exporting = `export default APP;`

    return {
        dependencies,
        constants,
        "export": exporting
    }
}

/**
 * Generates the necessary code for handling automatic login using Firebase authentication.
 *
 * @param {Object} credentials - The user's login credentials.
 * @param {string} credentials.email - The email address of the user.
 * @param {string} credentials.password - The password of the user.
 * @returns {Object} An object containing the dependencies and the handler code for automatic login.
 */
function autoLoginHandler(credentials){

    const dependencies = `import { setPersistence, signInWithEmailAndPassword, browserSessionPersistence, getAuth } from "firebase/auth";`

    const handler = `const AUTH = getAuth(APP);

/**
 * Authenticates a user using email and password, and sets the session persistence.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the authentication process is complete.
 */
async function authenticate(){
  await signInWithEmailAndPassword(AUTH, "${credentials.email}", "${credentials.password}")
    .then( () => {
      const ENVS = import.meta.env
      if(ENVS.MODE === "development"){
        console.log("Logged in")
      }
    })

  setPersistence(AUTH, browserSessionPersistence)
    .then(() => {
      return signInWithEmailAndPassword(AUTH, "${credentials.email}", "${credentials.password}")
    })
}

( async () => {
  authenticate()
})()
`

    return { dependencies, handler }

}

/**
 * Initializes and formats the Firebase application setup file.
 *
 * @param {string} projectId - The unique identifier for the Firebase project.
 * @param {Object} configs - The configuration object for Firebase, containing keys and settings.
 * @param {Object} [options] - Optional settings for the initialization process.
 * @param {boolean} [options.autoLogin=false] - Flag indicating whether to include automatic login handling.
 * @param {Object} [options.credentials] - The user's login credentials, required if autoLogin is true.
 * @param {string} [options.credentials.email] - The email address of the user.
 * @param {string} [options.credentials.password] - The password of the user.
 * @returns {Promise<string>} A promise that resolves to a formatted string of the Firebase app initialization code.
 */
async function initAppFile(projectId, configs, options = { autoLogin: false }){

    const basic = basicApp(projectId, configs);
    let login = options.autoLogin && options.credentials ? autoLoginHandler(options.credentials) : undefined; 

    let template = "";

    if(login){

        template = `${basic.dependencies}
${login.dependencies}

${basic.constants}
${login.handler}

${basic.export}`

    } else {
        template = `${basic.dependencies}

${basic.constants}

${basic.export}`
    }


    const prettiefiedTemplate = await prettier.format(template, {"parser": "typescript"})

    return prettiefiedTemplate

}

module.exports.initAppFile = initAppFile;

async function scriptFile(project){

  const { projectId, hostingApp: { shortUrl } } = project

  const script = `const { select } = require("@inquirer/prompts");
const { init } = require("../utilities/firebase.cjs");
const LOGGER = require("../utilities/logger.cjs");

const PROJECT_ID = "${projectId}";
const APP_URL = "${shortUrl}";

async function run(){

  await init(PROJECT_ID, { appUrl: APP_URL })

}

run();`

  const prettiefied = await prettier.format(script, { parser: "typescript"})

  return prettiefied
}

module.exports.scriptFile = scriptFile;

async function scriptFileLocal(project){

  const { projectId, hostingApp: { shortUrl }, local: { rtdb } } = project

  const script = `const { select } = require("@inquirer/prompts");
const { init } = require("../utilities/firebase.cjs");
const LOGGER = require("../utilities/logger.cjs");

const PROJECT_ID = "${projectId}";
const APP_URL = "${shortUrl}";
const RTDB_PORT = ${rtdb};

async function run(){

  await init(PROJECT_ID, { appUrl: APP_URL, local: true }, { local: { "databaseURL": "http://127.0.0.1:${rtdb}/?ns=${projectId}-default-rtdb" }})

}

run();`

  const prettiefied = await prettier.format(script, { parser: "typescript"})

  return prettiefied
}

module.exports.scriptFileLocal = scriptFileLocal;