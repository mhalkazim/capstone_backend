const mongoose = require('mongoose');


// Creating the schema
const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date_created: {
        type: Date,
        required: true,
        default: Date.now
    },
    phonenumber: {
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    }
    
    
});

// Creating the model
const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;