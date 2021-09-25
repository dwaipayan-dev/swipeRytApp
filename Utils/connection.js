require('dotenv').config();

const mongoose = require('mongoose');

var connectURI = process.env.MONGO_CONNECT_URI || 'mongodb://localhost:27017/swipeDB';

const connectDB = ()=>{
    return mongoose.connect(connectURI);
};

module.exports = connectDB;