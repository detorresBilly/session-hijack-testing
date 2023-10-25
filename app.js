const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const middleware = require('./middleware');
const userModel = require('./mongo/userModel');
const postModel = require('./mongo/postModel');


const port = 3000;
let sessionId = 1000000000 + Math.floor(Math.random() * 8999999999);

const app = express();
const cookieValidation = middleware.createValidateCookieMiddleware(5, 100000, 'file.LOG', false);
const requestLogger = middleware.createRequestLoggerMiddleware(10, 10000, 'file.LOG', false);

app.use(express.static('public', { 'extensions': ['js', 'css', 'ico'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

async function logoutUser(userId) {
    const user = await userModel.findOne({userId: userId});
    user.sessionId = undefined;
    await user.save();
}

async function generateSessionCookie(req, userId) {
    const user = await userModel.findOne({userId: userId});
    const newSessionId = (sessionId++) + '-' + userId;
    user.sessionId = newSessionId;
    user.ipAddress = req.ip;
    user.userAgent = req.get("User-Agent");
    await user.save();
    return newSessionId;
}

app.get('/', cookieValidation, (req, res) => {
    res.sendFile(__dirname + '/public/user.html');
});

app.get('/api/user', cookieValidation, async (req, res) => {
    const { cookies } = req;
    user = await userModel.findOne({sessionId : cookies.session_id});
    res.json(user);
});

app.post('/api/posts', cookieValidation, async (req, res) => {
    const { cookies } = req;
    user = await userModel.findOne({sessionId : cookies.session_id});
    const { postbody } = req.body;
    const date = new Date().toLocaleDateString();
    try {
        postModel.create({
            author: user.name,
            content: postbody,
            datePosted: date
        });
        res.redirect('../../');
    } catch(err) {
        res.send(err)
    }
});

app.get('/api/posts', cookieValidation, async (req, res) => {
    posts = await postModel.find();
    res.json(posts);
});


app.get('/logout', cookieValidation, async (req, res) => {
    const { cookies } = req;
    await logoutUser(cookies.session_id.split('-')[1]);
    res.clearCookie('session_id');
    res.redirect('../');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if(await userModel.exists({name: username})) {
        const user = await userModel.findOne({name: username});
        if(user.password == password) {
            const sessionId = await generateSessionCookie(req, user.userId);
            res.cookie('session_id', sessionId);
            res.redirect('../');
        } else {
            res.send('<p>wrong password</p><a href="/login">back</a>')
        }
    } else {
        res.send('<p>user does not exist</p><a href="/login">back</a>')
    }
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/createAcc', async (req, res) => {
    const { username, password } = req.body;
    if(await userModel.exists({name: username})) {
        res.send('<p>user already exists</p><a href="/login">back</a>');
    } else {
        let highestId = 0;
        const userModelHighestId = await userModel.findOne().sort({ userId: -1});
        if(userModelHighestId) highestId = userModelHighestId.userId;
        try {
            userModel.create({
                name: username,
                password: password,
                userId: (highestId + 1)
            });
            const sessionId = await generateSessionCookie(req, (highestId + 1));
            res.cookie('session_id', sessionId);
            res.redirect('../');
        } catch(err) {
            res.send(err)
        }
    }
});


