const {model, Schema} = require('mongoose');

let ticketSchema = new Schema({
    Guild: String,
    On: Boolean,
    TicketCategory: String,
    TicketChannel: String,
});

module.exports = model('ticketSchema', ticketSchema);