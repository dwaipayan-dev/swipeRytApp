const mongoose = require('mongoose');

var connectURI = 'mongodb://localhost:27017/swipeDB';

const connectDB = ()=>{
    return mongoose.connect(connectURI);
};

module.exports = connectDB;