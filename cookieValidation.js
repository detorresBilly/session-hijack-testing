const writeToLog = require('./writeToLog')
const userModel = require('./mongo/userModel');

const invalidCookieCounts = {};

function createValidateCookieMiddleware(rateLimit = 2, windowMs = 100000, logFile = 'file.LOG', debugMode = false) {

    //Validates session cookie to user from database
    //Logs warning if request contains an invalid session cookie or 
    //if IP address/User-Agent has changed since generation
    return async function validateCookie(req, res, next) {
        const clientIP = req.ip;
        const clientUserAgent = req.get('User-Agent');
        const cookies = req.cookies;
        const currTime = Date.now();

        if ('session_id' in cookies) {
            const user = await userModel.findOne({ sessionId: cookies.session_id });
            console.log(user);

            //If a user account corresponding to the provided session cookie is found
            if (user) {
                
                //IP address does not match IP logged upon creation of session cookie
                if (user.ipAddress != clientIP) {
                    const logMessage = `[Warning] User: ${user.name} IP mismatch.
                    IP sent: ${clientIP} IP in DB: ${user.ipAddress}\n`;
                    writeToLog(logFile, logMessage);
                }

                //User-Agent does not match IP logged upon creation of session cookie
                if (user.userAgent != clientUserAgent) {
                    const logMessage = `[Warning] User: ${user.name} User-Agent mismatch. ` +
                        `User-Agent sent: ${clientUserAgent} User-Agent in DB: ${user.userAgent}\n`;
                    writeToLog(logFile, logMessage);
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
                }

                invalidCookieCounts[clientIP].count++;

            }
        }
        res.redirect('/login');
    }

}

module.exports = createValidateCookieMiddleware;