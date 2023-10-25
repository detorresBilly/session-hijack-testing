const writeToLog = require('./writeToLog')
const userModel = require('./mongo/userModel');

const invalidCookieCounts = {};
const requestCounts = {};

const confusionMatrix = {
    truePositives: 0,
    falsePositives: 0,
    trueNegatives: 0,
    falseNegatives: 0,
};

function createValidateCookieMiddleware(rateLimit = 2, windowMs = 100000, logFile = 'file.LOG', debugMode = false) {

    //Validates session cookie to user from database
    //Logs warning if request contains an invalid session cookie or 
    //if IP address/User-Agent has changed since generation
    return async function validateCookie(req, res, next) {
        let clientIP = req.ip;
        if(debugMode) clientIP = req.cookies.ip_address;

        const clientUserAgent = req.get('User-Agent');

        const currTime = Date.now();

        if ('session_id' in req.cookies) {
            const user = await userModel.findOne({ sessionId: req.cookies.session_id });

            //If a user account corresponding to the provided session cookie is found
            if (user) {

                //IP address does not match IP logged upon creation of session cookie
                if (user.ipAddress != clientIP) {
                    const logMessage = `[Warning] ${new Date(currTime).toISOString()} User: ${user.name} IP mismatch.
                    IP sent: ${clientIP} IP in DB: ${user.ipAddress}\n`;
                    writeToLog(logFile, logMessage);

                    
                    if(debugMode) {
                        if(req.cookies.attacker == "true") {
                            confusionMatrix.truePositives++;
                        } else {
                            confusionMatrix.falsePositives++;
                        }
                    }
                } else {
                    if(debugMode) {
                        if(req.cookies.attacker == "true") {
                            confusionMatrix.falseNegatives++;
                        } else {
                            confusionMatrix.trueNegatives++;
                        }
                    }
                }

                //User-Agent does not match IP logged upon creation of session cookie
                if (user.userAgent != clientUserAgent) {
                    const logMessage = `[Warning] User: ${user.name} User-Agent mismatch. ` +
                        `User-Agent sent: ${clientUserAgent} User-Agent in DB: ${user.userAgent}\n`;
                    writeToLog(logFile, logMessage);

                    
                    if(debugMode) {
                        if(req.cookies.attacker == "true") {
                            confusionMatrix.truePositives++;
                        } else {
                            confusionMatrix.falsePositives++;
                        }
                    }
                } else {
                    if(debugMode) {
                        if(req.cookies.attacker == "true") {
                            confusionMatrix.falseNegatives++;
                        } else {
                            confusionMatrix.trueNegatives++;
                        }
                    }
                }

                return next();
            }

            //User sent an invalid session cookie with request
            else {

                //if IP does not exist in object create it
                if (!invalidCookieCounts[clientIP]) {
                    invalidCookieCounts[clientIP] = {
                        count: 0,
                        windowStart: currTime,
                    };
                }

                //if rate limit time window has passed reset request count
                if (currTime - windowMs > invalidCookieCounts[clientIP].windowStart) {
                    invalidCookieCounts[clientIP].count = 0;
                    invalidCookieCounts[clientIP].windowStart = currTime;
                }

                //if request count has exceeded rate limit write warning
                if (invalidCookieCounts[clientIP].count >= rateLimit) {
                    const logMessage = `[Warning] ${req.ip} Sent ${invalidCookieCounts[clientIP].count} ` +
                        `invalid cookies in ${currTime - invalidCookieCounts[clientIP].windowStart}ms\n`;
                    writeToLog(logFile, logMessage);

                    
                    if(debugMode) {
                        if(req.cookies.attacker == "true") {
                            confusionMatrix.truePositives++;
                        } else {
                            confusionMatrix.falsePositives++;
                        }
                    }
                } else {
                    if(debugMode) {
                        if(req.cookies.attacker == "true") {
                            confusionMatrix.falseNegatives++;
                        } else {
                            confusionMatrix.trueNegatives++;
                        }
                    }
                }

                invalidCookieCounts[clientIP].count++;

            }
        }
        res.redirect('/login');
    }

}

function createRequestLoggerMiddleware(rateLimit = 10, windowMs = 10000, logFile = 'file.LOG', debugMode = false) {

    //Writes requests to log file
    //Writes warning if IP address exceeds rateLimit requests within windowMs time window
    return function requestLogger(req, res, next) {
        let clientIP = req.ip;
        if(debugMode) clientIP = req.cookies.ip_address;

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

            if(debugMode) {
                if(req.cookies.attacker == "true") {
                    confusionMatrix.truePositives++;
                } else {
                    confusionMatrix.falsePositives++;
                }
            }
        }

        //else log the request
        else {
            const logMessage = `[Info] ${requestMsg} \n`;
            writeToLog(logFile, logMessage);

            if(debugMode) {
                if(req.cookies.attacker == "true") {
                    confusionMatrix.falseNegatives++;
                } else {
                    confusionMatrix.trueNegatives++;
                }
            }
        }

        requestCounts[clientIP].count++;

        if(debugMode) console.log(confusionMatrix);

        next();
    };
}

module.exports = {
    createValidateCookieMiddleware,
    createRequestLoggerMiddleware,
};