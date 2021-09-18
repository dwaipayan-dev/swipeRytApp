const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    first_name: String,
    last_name: String,
    phone_number: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;