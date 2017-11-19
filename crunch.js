require('dotenv').config();

const mongoose = require('mongoose');
const MA = require('./server/indicators').MA;
const MASettings = require('./server/settings').MA;
const helper = require('./server/helper');
const trader = require('./server/trader/offline_trade');

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
        let timestamp = 1;

        helper.getCandles(timestamp, CHUNKSIZE, (docs) => {
            if (docs) {
                let sampleCandles = helper.groupCandles(docs, CHUNKSIZE);
                lastCandleTimeStamp = docs[docs.length - 1].timestamp;

                mapMovingAverages(sampleCandles);
                analyzeCrosses(sampleCandles);
            }
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

    console.log('BTC                  |                USD              |             TIMESTAMP');
    candles.forEach((candle, index) => {
        // check if current trend is different from previous trend
        if (index !== 0) {
            if (candles[index - 1].trend !== candle.trend) {
                let offset = new Date().getTimezoneOffset() * 60;
                let timestamp = candle.timestamp - offset;
                let date = new Date(timestamp * 1000).toUTCString();

                trader.trade(candle);
                let report = trader.report();

                console.log('===============================================================================');
                console.log(`${report.BTC}        |                  ${report.USD}         |        ${date}`);
            }
        }
    });
}


function testValidator (timestamp, candles) {
    let result = isValid(timestamp, candles);
    console.log(result);
}

function isValid (timestamp, candleData) {
    // look for a candle that matches this timestamp
    // from that point, search to see if a down trend has happened
    let result = true;
    let candleWithTimeStampIndex = -1;

    candleData.forEach((candle, index) => {
        if (candle.timestamp == timestamp) {
            candleWithTimeStampIndex = index;
        }
    });

    if (candleWithTimeStampIndex != -1) {
        for (let i = candleWithTimeStampIndex; i < candleData.length; i++) {
            let candle = candleData[i];
            if (candle.trend != 'up') {
                result = false;
            };
        }
    }

    return result;
}
