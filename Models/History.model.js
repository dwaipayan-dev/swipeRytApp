const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    image_id:{
        type: Number,
        required: true
    },
    image_URL:String,
    status: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const History = mongoose.model('History', historySchema);

module.exports = History;