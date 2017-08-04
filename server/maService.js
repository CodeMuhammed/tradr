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
                return candle;
            });
        } else {
            console.log('not enough data to calculate moving averages');
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

                // check if the recently added candles have an intersection
                let message;
                for (let i = 0; i < sampleCandles.length; i++) {
                    if (sampleCandles[i].longMA > sampleCandles[i].shortMA) {
                        message = 'Sell';
                    } else if (sampleCandles[i].longMA < sampleCandles[i].shortMA) {
                        message = 'Buy';
                    }
                }

                if (message) {
                    moduleEvents.emit('cross', {
                        message: message,
                        price: sampleCandles[sampleCandles.length - 1].close
                    });
                }

                console.log('Candle stats');
                console.log(sampleCandles[sampleCandles.length - 1]);
            })
        }, (CHUNKSIZE * 60 * 1000));
    }

    return moduleEvents;
}
