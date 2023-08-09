const {model, Schema} = require('mongoose');

let groupSchema = new Schema({
    Guild: String,
    Group: String,
    Admin: String,
    Mod: { type: Array, default: [] },
    channels: Number,
    channelmax: Number,
    voice: Number,
    voicemax: Number,
    GroupCategory: String,
});

module.exports = model('groupSchema', groupSchema);