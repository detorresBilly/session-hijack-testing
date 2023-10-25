const writeToLog = require('./writeToLog')

const requestCounts = {};

function createRateLimitMiddleware(rateLimit = 10, windowMs = 10000, logFile = 'file.LOG', debugMode = false) {

    //Writes requests to log file
    //Writes warning if IP address exceeds rateLimit requests within windowMs time window
    return function requestLogger(req, res, next) {
        const clientIP = req.ip;
        const clientUserAgent = req.get('User-Agent');
        const currTime = Date.now();
        const requestMsg = `${new Date(currTime).toISOString()} ${clientIP} ` +
        `${req.method} ${req.path} User-Agent: ${clientUserAgent}`

        //if IP does not exist in object create it
        if (!requestCounts[clientIP]) {
            requestCounts[clientIP] = {
                count: 0,
                windowStart: currTime,
            };
        }

        //if rate limit time window has passed reset request count
        if (currTime - windowMs > requestCounts[clientIP].windowStart) {
            requestCounts[clientIP].count = 0;
            requestCounts[clientIP].windowStart = currTime;
        }

        //if request count has exceeded rate limit write warning
        if (requestCounts[clientIP].count >= rateLimit) {
            const logMessage = `[Warning] ${requestMsg} Sent ${requestCounts[clientIP].count} ` +
            `requests in ${currTime - requestCounts[clientIP].windowStart}ms\n`;
            writeToLog(logFile, logMessage);
        }

        //else log the request
        else {
            const logMessage = `[Info] ${requestMsg} \n`;
            writeToLog(logFile, logMessage);
        }

        requestCounts[clientIP].count++;

        next();
    };
}

module.exports = createRateLimitMiddleware;