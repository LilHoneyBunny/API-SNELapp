const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const MessageSchema = new mongoose.Schema({
    Text: String,
    Date: {
        type: Date,
        default: Date.now,
        required: true
    },
    UserType: {
        type: String,
        enum: ['Student', 'Instructor'],
        required:true
    },
})

const ChatSchema = new mongoose.Schema({
    IdChat: {
        type: Number,
        unique: true,
    },
    IdStudent: Number,
    IdInstructor: Number,
    Messages: {
        type: [MessageSchema]
    }
})

ChatSchema.plugin(AutoIncrement, {
    inc_field: 'IdChat',
    start_seq: 1,
});

module.exports = mongoose.model('Chat', ChatSchema);