const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const candlestickSchema = new Schema({
    open: String,
    close: String,
    high: String,
    low: String,
    volume: Number,
    amount: String, // same as volume
    price_str: String, // same as close
    timestamp: Number
});

module.exports = mongoose.model('Candlestick', candlestickSchema);
