const {model, Schema} = require('mongoose');

let serverSchema = new Schema({
    Guild: String,
    Channel: String,
    Message: String,
});

module.exports = model('serverSchema', serverSchema);