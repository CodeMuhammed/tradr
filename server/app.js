const Candlestick = require('./models/candlestick');
const helper = require('./helper');
const settings = require('./settings');
const ticker = require('./services/tickerService');
const cronJob = require('./services/cronjobService');
const MAService = require('./services/maService')(settings.MA);

const run = () => {
    ticker.tick();
    cronJob.start();

    helper.currentTimestamp((timestamp) => {
        let days = 30 * 24 * 3600;
        timestamp = timestamp - days;

        // delete all data older than 30days
        Candlestick.remove({
            timestamp: { $lte: timestamp }
        }, (err, stats) => {
            if (err) {
                throw new Error('Cannot truncate dataset');
            } else {
                MAService.events.on('cross', (candle) => {
                    console.log(candle);
                    // @TODO we transfer functionality to the trading service
                    // tradingService.trade(candle, (err, stats) => { console.log(err || stats); });
                    // if enter, we enter a position with the trading service.
                    // we start the MT-tracker algorithm, which monitors the market for maximum takeout, before 
                    // the closing trigger is fired by the MA service.
                });
            }
        });
    });
}

module.exports = { run };
