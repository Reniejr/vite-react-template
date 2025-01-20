function logger(type, message){

    switch(type){
        case 'success':
            console.log(`\x1b[42m ${message} \x1b[42m`);
            break;
        case 'info':
            console.log(`\x1b[44m ${message} \x1b[44m`);
            break;
        case 'warn':
            console.log(`\x1b[43m ${message} \x1b[43m`);
            break;
        case 'error':
            console.log(`\x1b[41m ${message} \x1b[41m`);
            break;
        default:
            console.log(message);
            break;
    }

}

module.exports = { logger };