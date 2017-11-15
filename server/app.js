const Candlestick = require('./models/candlestick');
const helper = require('./helper');
const settings = require('./settings');
const ticker = require('./services/tickerService');
const cronJob = require('./services/cronjobService');

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
                // @TODO create a watcher module instead
                let MAService = require('./services/maService')(settings.MA);

                MAService.on('cross', (message) => {
                    // We triggger an entery into the market
                    // we start the process in the service for max takeout

                    // we trigger an emergency exit from the market
                    // we end the process in the service for mas takeout
                });
            }
        });
    });
}

module.exports = { run };
