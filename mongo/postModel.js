const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    author: String,
    content: String,
    datePosted: String
});

module.exports = mongoose.createConnection('mongodb://localhost:27017/poststore', { useUnifiedTopology: true, useNewUrlParser: true }).model("Posts", postSchema);