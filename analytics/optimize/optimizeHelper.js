require('dotenv').config();

const mongoose = require('mongoose');
const MA = require('../../server/indicators').MA;
const helper = require('../../server/helper');
const trader = require('../../server/trader/trade_analysis');

const dbUrl = process.env.db_url_dev || process.env.db_url_prod;
// connect to mongoose here
const generateTradeData = (candle, cb) => {
    mongoose
        .connect(dbUrl, { useMongoClient: true })
        .then(() => {
            console.log('connected successfully to the database');
            const CHUNKSIZE = candle;

            // let lastCandleTimeStamp = '';
            let timestamp = 1;

            helper.getCandles(timestamp, CHUNKSIZE, (docs) => {
                if (docs) {
                    let sampleCandles = helper.groupCandles(docs, CHUNKSIZE);
                    cb(sampleCandles);
                }
            });
        })
        .catch(err => console.error(err));
}

// This function calculates the moving average for each candle stick
const mapMovingAverages = (sampleCandles, settings) => {
    const shortMA = new MA(settings.short);
    const longMA = new MA(settings.long);
    if (sampleCandles.length > 0) {
        // calculates all moving averages
        let sampleCandlesObject = sampleCandles.map((candle) => {
            candle.shortMA = shortMA.getNextAverage(parseFloat(candle.close));
            candle.longMA = longMA.getNextAverage(parseFloat(candle.close));
            return candle;
        });

        return sampleCandlesObject;
    } else {
        console.log('not enough data to calculate moving averages');
    }
}

const analyzeCrosses = (candles, settings) => {
    let finalBTC = 0;
    let finalUSD = 0;
    trader.resetBalance();
    candles = candles.map((candle) => {
        candle.trend = candle.longMA > candle.shortMA ? 'down' : 'up';
        return candle;
    });
    candles.forEach((candle, index) => {
        // check if current trend is different from previous trend
        if (index !== 0) {
            if (candles[index - 1].trend !== candle.trend) {
                let offset = new Date().getTimezoneOffset() * 60;
                let timestamp = candle.timestamp - offset;
                let date = new Date(timestamp * 1000).toUTCString();

                trader.trade(candle);
                let report = trader.report();
                finalBTC = report.BTC;
                finalUSD = report.USD;
            }
        }
    });

    let result = {};
    result.settings = {short: settings.short, long: settings.long};
    result.usd = finalUSD;
    result.btc = finalBTC;

    console.log('=======================================================================');
    console.log(`SETTINGS:    shortMA: ${settings.short},     longMA: ${settings.long}`);
    console.log(` `);
    console.log(` Final BTC: ${finalBTC}`);
    console.log(` Final USD: ${finalUSD}`);
    console.log('========================================================================');

    return result;
}

module.exports = { generateTradeData, mapMovingAverages, analyzeCrosses };
