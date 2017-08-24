require('dotenv').config();

const mongoose = require('mongoose');
const MA = require('./indicators').MA;
const helper = require('./helper');
const dbUrl = process.env.db_url_dev || process.env.db_url_prod;

// connect to mongoose here
mongoose
    .connect(dbUrl, { useMongoClient: true })
    .then(() => {
        console.log('connected successfully to the database');
        const shortMA = new MA(5);
        const longMA = new MA(40);
        const CHUNKSIZE = 5;

        let lastCandleTimeStamp = '';

        // Get current ticker timestamp from bitstamp, then backdate it 48hours
        helper.currentTimestamp((timestamp) => {
            timestamp = timestamp - (48 * 3600);

            helper.getCandles(timestamp, CHUNKSIZE, (docs) => {
                if (docs) {
                    let sampleCandles = helper.groupCandles(docs, CHUNKSIZE);
                    lastCandleTimeStamp = docs[docs.length - 1].timestamp;

                    mapMovingAverages(sampleCandles);
                    analyzeCrosses(sampleCandles);
                }
            })
        });

        // This function calculates the moving average for each candle stick
        function mapMovingAverages (sampleCandles) {
            if (sampleCandles.length > 0) {
                // calculates all moving averages
                sampleCandles = sampleCandles.map((candle) => {
                    candle.shortMA = shortMA.getNextAverage(parseFloat(candle.close));
                    candle.longMA = longMA.getNextAverage(parseFloat(candle.close));
                    return candle;
                });
            } else {
                console.log('not enough data to calculate moving averages');
            }
        }
    })
    .catch(err => console.error(err));


function analyzeCrosses (candles) {
    candles.forEach((candle) => {
        if (candle.longMA > candle.shortMA) {
            console.log('Downtrend ', candle.close, new Date(candle.timestamp * 1000));
        } else if (candle.longMA < candle.shortMA) {
            console.log('Uptrend ', candle.close, new Date(candle.timestamp * 1000));
        }
    });
}
