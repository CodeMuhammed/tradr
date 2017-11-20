let tradeValidator = {
    isValid: (timestamp) => {
        return true;
    }
};

require('dotenv').config();
const mongoose = require('mongoose');
const dbUrl = process.env.db_url_dev || process.env.db_url_prod;

const trader = require('../server/services/traderService')(tradeValidator);

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

// connect to mongoose here
mongoose
    .connect(dbUrl, { useMongoClient: true })
    .then(() => {
        setTimeout(() => {
            /*trader.trade(candle)
                .then(
                    (stats) => {
                        console.log('Trade operation successful', candle.trend);
                        console.log(stats);
                    },
                    (err) => {
                        console.log(err);
                    }
                );*/
        }, 5000);
    });
