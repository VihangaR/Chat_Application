var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
    handle: String,
    msg: String,
    created: {type: Date, default: Date.now}
});

var Message = mongoose.model("Message", messageSchema);
module.exports = Message;