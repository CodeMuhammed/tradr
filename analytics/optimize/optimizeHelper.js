require('dotenv').config();

const mongoose = require('mongoose');
const MA = require('../../server/indicators').MA;
const MASettings = require('../../server/settings').MA;
const helper = require('../../server/helper');
// const trader = require('../../server/trader/offline_trade');

const dbUrl = process.env.db_url_dev || process.env.db_url_prod;
// connect to mongoose here
const generateTradeData = (cb) => {
    mongoose
        .connect(dbUrl, { useMongoClient: true })
        .then(() => {
            console.log('connected successfully to the database');
            const shortMA = new MA(MASettings.short);
            const longMA = new MA(MASettings.long);
            const CHUNKSIZE = MASettings.candle;

            let lastCandleTimeStamp = '';
            let timestamp = 1;

            helper.getCandles(timestamp, CHUNKSIZE, (docs) => {
                if (docs) {
                    let sampleCandles = helper.groupCandles(docs, CHUNKSIZE);
                    // lastCandleTimeStamp = docs[docs.length - 1].timestamp;

                    // let candle = mapMovingAverages(sampleCandles);
                    // console.log(1, sampleCandles);
                    cb(sampleCandles);
                    // analyzeCrosses(sampleCandles);
                }
            });

            // This function calculates the moving average for each candle stick
            // function mapMovingAverages (sampleCandles) {
            //     if (sampleCandles.length > 0) {
            //         // calculates all moving averages
            //         sampleCandles = sampleCandles.map((candle) => {
            //             candle.shortMA = shortMA.getNextAverage(parseFloat(candle.close));
            //             candle.longMA = longMA.getNextAverage(parseFloat(candle.close));
            //             return candle;
            //         });
            //     } else {
            //         console.log('not enough data to calculate moving averages');
            //     }
            // }
        })
        .catch(err => console.error(err));
}

module.exports = { generateTradeData };
