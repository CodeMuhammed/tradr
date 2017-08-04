const EventEmitter = require('events').EventEmitter;
const moduleEvents = new EventEmitter;
const helper = require('./helper');
const MA = require('./indicators').MA;

module.exports = (long, short, timeInterval) => {
    const shortMA = new MA(short);
    const longMA = new MA(long);
    const CHUNKSIZE = timeInterval;

    let candleData = [];
    let lastCandleTimeStamp = '';

    // Get current ticker timestamp from bitstamp, then backdate it 48hours
    helper.currentTimestamp((timestamp) => {
        timestamp = timestamp - (48 * 3600);

        helper.getCandles(timestamp, CHUNKSIZE, (docs) => {
            let sampleCandles = helper.groupCandles(docs, CHUNKSIZE);
            lastCandleTimeStamp = docs[docs.length - 1].timestamp;

            mapMovingAverages(sampleCandles);
            candleData = sampleCandles;
            runCron();
        })
    });

    // This function calculates the moving average for each candle stick
    function mapMovingAverages (sampleCandles) {
        if (sampleCandles.length > 0) {
            // calculates all moving averages
            sampleCandles = sampleCandles.map((candle) => {
                candle.shortMA = shortMA.getNextAverage(parseFloat(candle.close));
                candle.longMA = longMA.getNextAverage(parseFloat(candle.close));

                if (candle.longMA > candle.shortMA) {
                    candle.trend = 'up';
                } else {
                    candle.trend = 'down';
                }

                return candle;
            });
        } else {
            console.log('not enough data to calculate moving averages');
        }
    }

    // This function detects trend reversal
    function checkForTrendReversal () {
        let prevCandle = candleData[candleData.length - 2];
        let lastCandle = candleData[candleData.length - 1];

        if (prevCandle.trend !== lastCandle.trend) {
            console.log('There is a reversal here');
            console.log(prevCandle);
            console.log(lastCandle);
        } else {
            console.log('Markets still trending ', lastCandle.trend);
        }
    }

    // This cron job calculates the latest moving average every ${CHUNKSIZE} mins
    function runCron () {
        console.log(candleData.length + ' candles grouped');
        setTimeout(() => {
            console.log('process new candles');
            helper.getCandles(lastCandleTimeStamp, CHUNKSIZE, (docs) => {
                let sampleCandles = helper.groupCandles(docs, CHUNKSIZE);
                lastCandleTimeStamp = docs[docs.length - 1].timestamp;

                mapMovingAverages(sampleCandles);
                candleData = candleData.concat(sampleCandles);
                checkForTrendReversal();
            })
        }, (CHUNKSIZE * 60 * 1000));
    }

    return moduleEvents;
}
