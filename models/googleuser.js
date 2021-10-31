const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const googleUserSchema = new Schema({
    name: String,
    email: String,
    googleId: String,
    profilePicUrl : {
        type: String,
        default: ''
    },
    profilePicfileName : String,
    date: {
        type: Date,
        default: Date.now
    },
    degree: {
        type: String, 
        default: 'undefined'
    },
    interested: [{
        type: String,
        default: []
    }],
    isAdmin: {
        type: Boolean,
        default: true
    },
    enrollIn:[{
        type :Schema.Types.ObjectId,
        ref: 'Event'
    }],
    facebook: {
        type: String,
        default: ''
    },
    instagram: {
        type: String,
        default: ''
    },
    twitter:{
        type: String,
        default: ''
    },
})

module.exports = mongoose.model('GoogleUser', googleUserSchema);