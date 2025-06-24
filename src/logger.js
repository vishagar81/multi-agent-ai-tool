import colors from 'colors';

export function logMessage(message, level) {
    switch (level) {
        case 'REASON':
            console.log(colors.blue('REASON: ' + message));
            break;
        case 'ACTION':
            console.log(colors.yellow('ACTION: ' + message));
            break;
        case 'error':
            console.log(colors.red('ERROR: ' + message));
            break;
        case 'RESPONSE':
            console.log(colors.green('RESPONSE: ' + message));
            break;
        default:
            console.log(message);
    }
}