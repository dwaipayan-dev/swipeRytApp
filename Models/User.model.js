const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    phone_number: {
        type: String,
        unique: true,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;