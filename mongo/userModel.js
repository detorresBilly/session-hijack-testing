const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    userId: Number,
    sessionId: String,
    userAgent: String,
    ipAddress: String,
});

module.exports = mongoose.createConnection('mongodb://localhost:27017/userstore', { useUnifiedTopology: true, useNewUrlParser: true }).model("User", userSchema);