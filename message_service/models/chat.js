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
        enum: ['student', 'instructor'],
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
    Message: {
        type: [MessageSchema]
    }
})

ChatSchema.plugin(AutoIncrement, {
    inc_field: 'idChat',
    start_seq: 1,
});

module.exports = mongoose.model('Chat', ChatSchema);