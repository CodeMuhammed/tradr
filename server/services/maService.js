const EventEmitter = require('events').EventEmitter;
const moduleEvents = new EventEmitter;
const helper = require('../helper');
const MA = require('../indicators').MA;

module.exports = (settings) => {
    const shortMA = new MA(settings.short);
    const longMA = new MA(settings.long);
    const CHUNKSIZE = settings.candle;

    let candlesData = [];
    let lastCandleTimeStamp = '';

    function init (callback) {
        helper.getCandles(1, CHUNKSIZE, (docs) => {
            if (docs) {
                let sampleCandles = helper.groupCandles(docs, CHUNKSIZE);
                lastCandleTimeStamp = docs[docs.length - 1].timestamp;

                mapMovingAverages(sampleCandles);
                candlesData = sampleCandles;
                runCron();
                callback();
            }
        });
    }

    // This function checks to see if we are still holding a valid position
    function isValid (timestamp) {
        let result = true;
        let candleWithTimeStampIndex = -1;

        candlesData.forEach((candle, index) => {
            if (candle.timestamp == timestamp) {
                candleWithTimeStampIndex = index;
            }
        });

        if (candleWithTimeStampIndex != -1) {
            for (let i = candleWithTimeStampIndex; i < candlesData.length; i++) {
                let candle = candlesData[i];
                if (candle.trend != 'up') {
                    result = false;
                };
            }
        }

        console.log(candleWithTimeStampIndex, 'here candleWithTimeStampIndex');

        return result;
    }

    // This function calculates the moving average for each candle stick
    function mapMovingAverages (sampleCandles) {
        if (sampleCandles.length > 0) {
            // calculates all moving averages
            sampleCandles = sampleCandles.map((candle) => {
                candle.shortMA = shortMA.getNextAverage(parseFloat(candle.close));
                candle.longMA = longMA.getNextAverage(parseFloat(candle.close));

                if (candle.longMA > candle.shortMA) {
                    candle.trend = 'down';
                } else {
                    candle.trend = 'up';
                }

                return candle;
            });

            console.log('Candles generated');
        } else {
            console.log('not enough data to calculate moving averages');
        }
    }

    // This function detects trend reversal
    function checkForTrendReversal () {
        let prevCandle = candlesData[candlesData.length - 2];
        let lastCandle = candlesData[candlesData.length - 1];

        if (prevCandle.trend !== lastCandle.trend) {
            moduleEvents.emit('cross', lastCandle);
        } else {
            console.log('Markets still trending', lastCandle.trend);
        }
    }

    // This cron job calculates the latest moving average every ${CHUNKSIZE} mins
    function runCron () {
        console.log(`Waiting for ${CHUNKSIZE} mins`);
        setTimeout(() => {
            return helper.getCandles(lastCandleTimeStamp, CHUNKSIZE, (docs) => {
                if (docs) {
                    console.log(`process ${docs.length} new candles`);
                    let sampleCandles = helper.groupCandles(docs, CHUNKSIZE);
                    lastCandleTimeStamp = docs[docs.length - 1].timestamp;

                    mapMovingAverages(sampleCandles);
                    candlesData = candlesData.concat(sampleCandles);
                    checkForTrendReversal();
                }

                return runCron();
            });
        }, (CHUNKSIZE * 60 * 1000));
    }

    return {
        init,
        events: moduleEvents,
        tradeValidator: { isValid }
    };
}
