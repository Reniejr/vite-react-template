function firebase_template_initializeApps(projectsConfigs){

    let app_initialized_template = ``

    projectsConfigs.forEach( function( projectInfo ){

        const { alias, name, configs } = projectInfo;

        app_initialized_template += `const ${alias.toUpperCase().replaceAll("-", "_")}_${name.toUpperCase().replaceAll("-", "_")}_FIREBASE_CONFIGS = {
    "apiKey": "${configs.apiKey}",
    "authDomain": "${configs.authDomain}",
    "databaseURL": "${configs.databaseURL}",
    "projectId": "${configs.projectId}",
    "storageBucket": "${configs.storageBucket}",
    "messagingSenderId": "${configs.messagingSenderId}",
    "appId": "${configs.appId}"
}

export const ${alias.toUpperCase().replaceAll("-", "_")}_${name.toUpperCase().replaceAll("-", "_")}_APP = initializeApp(${alias.toUpperCase().replaceAll("-", "_")}_${name.toUpperCase().replaceAll("-", "_")}_FIREBASE_CONFIGS, "${alias}");

`})

    return `import { initializeApp } from "firebase/app";

${app_initialized_template}
`
}

module.exports = { firebase_template_initializeApps }