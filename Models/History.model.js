const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user_phone:{
        type: String,
        required: true
    },
    image_id:{
        type: Number,
        required: true
    },
    status: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const History = mongoose.model('History', historySchema);

module.exports = History;