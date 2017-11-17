const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    entryPrice: String,
    entryTimestamp: Number,
    exitPrice: String,
    exitTimestamp: Number,
    status: String,
});

module.exports = mongoose.model('Trade', tradeSchema);
