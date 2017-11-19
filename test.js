require('dotenv').config();
const traderService = require('./server/services/traderService');
const mongoose = require('mongoose');
const dbUrl = process.env.db_url_dev || process.env.db_url_prod;

let candle = {
    open: '7468.26',
    close: '7475.00',
    high: '7480.94',
    low: '7468.26',
    volume: 41.536128470000016,
    timestamp: 1510846475,
    amount: 41.536128470000016,
    price_str: '7475.00',
    shortMA: 7446.586999999995,
    longMA: 7442.29025,
    trend: 'down'
};

let tradeValidator = {
    isValid: (timestamp) => {
        return true;
    }
};

// connect to mongoose here
mongoose
    .connect(dbUrl, { useMongoClient: true })
    .then(() => {
        let trader = traderService(tradeValidator);
        setTimeout(() => {
            trader.trade(candle)
                .then(
                    (err) => {
                        console.log(err);
                    },
                    (stats) => {
                        console.log(stats);
                    }
                );
        }, 10000);
    });
