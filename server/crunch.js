require('dotenv').config();

const mongoose = require('mongoose');
const MA = require('./indicators').MA;
const MASettings = require('./settings').MA;
const helper = require('./helper');
const trader = require('./trader');

const dbUrl = process.env.db_url_dev || process.env.db_url_prod;
// connect to mongoose here
mongoose
    .connect(dbUrl, { useMongoClient: true })
    .then(() => {
        console.log('connected successfully to the database');
        const shortMA = new MA(MASettings.short);
        const longMA = new MA(MASettings.long);
        const CHUNKSIZE = MASettings.candle;

        let lastCandleTimeStamp = '';

        // Get current ticker timestamp from bitstamp, then backdate it 48hours
        helper.currentTimestamp((timestamp) => {
            let twoDays = 48 * 3600;
            timestamp = timestamp - twoDays;

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
    candles = candles.map((candle) => {
        candle.trend = candle.longMA > candle.shortMA ? 'down' : 'up';
        return candle;
    });

    candles.forEach((candle, index) => {
        // trade here
        // @TODO check if current trend is different from previous trend
        if (index !== 0) {
            if (candles[index - 1].trend !== candle.trend) {
                trader.trade(candle);
            }
        }
    });

    console.log(trader.report());
}
