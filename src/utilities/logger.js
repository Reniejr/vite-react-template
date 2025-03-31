const ENVS = import.meta.env

/**
 * Logs information to the console when in development mode, including the file name, line number, and an optional message and variable.
 *
 * @param {string} [message=undefined] - An optional message to log.
 * @param {*} [variable=undefined] - An optional variable to log. If it's an object, it will be displayed as a table.
 * @returns {Object|undefined} - Returns an error object if the caller location cannot be determined, otherwise returns undefined.
 */
export function info(message = undefined, variable = undefined){

    if(ENVS.MODE !== "development") return;

    const stack = new Error().stack.split("\n").map(line => line.trim());
    const callerLine = stack[2].trim();

    const match = callerLine.match(/\((.*?):(\d+):(\d+)\)/);
    if (match) {

        const fileLocation = new URL(match[1]);
        const fileName = fileLocation.pathname.split("/").pop();
        const variableOrFunctionName = stack[2].split(" ")[1]
        const line = parseInt(match[2], 5)

        const variableType = typeof variable;

        if(variable){

            if(variableType === "object" && !Array.isArray(variable)){
                console.log(`[ ${fileName}:${line} - ${variableOrFunctionName} ] - ${message ? message : "No Message"}\n`);
                console.table(variable);     
            } else {
                console.log(`[ ${fileName}:${line} - ${variableOrFunctionName} ] - ${message ? message : "No Message"}\n`, variable);     
            }
        } else {
            console.log(`[ ${fileName}:${line} - ${variableOrFunctionName} ] - ${message ? message : "No Message"}\n`);     
        }

        return;
    }
    return { error: "Could not determine caller location" };
}

