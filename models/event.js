const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    description:{
        type:String,
        default: ''
    },  
    date: Date,
    venue: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GoogleUser'
    },
    enrolled:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GoogleUser'
    }],
    club:{
        type: String,
        default: 'undefined'
    }
})

module.exports = mongoose.model('Event', eventSchema);