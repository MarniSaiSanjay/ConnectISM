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
    public_id : {
        type: String,
        default: ''
    },
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
        default: false
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