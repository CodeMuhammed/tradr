const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    entryPrice: String,
    entryTimeStamp: Number,
    exitPrice: String,
    exitTimestamp: Number
});

module.exports = mongoose.model('Trade', tradeSchema);
