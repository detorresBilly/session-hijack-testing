const fs = require('fs');

function writeToLog(fileName, logMessage) {
    try {
        fs.appendFileSync(fileName, logMessage, 'utf-8');
    } catch(error) {
        console.error(`Error writing to ${fileName}: `, error);
    }
}

module.exports = writeToLog;