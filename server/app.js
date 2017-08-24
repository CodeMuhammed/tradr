const Candlestick = require('./models/candlestick');
const helper = require('./helper');
const settings = require('./settings');

const run = () => {
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
                require('./services/tickerService')();
                require('./services/cronjobService');

                // @TODO create a watcher module instead
                let MAService = require('./services/maService')(settings.MA);

                MAService.on('cross', (message) => {
                    console.log('cross here');
                    console.log(message);
                });
            }
        });
    });
}

module.exports = () => {
    return {
        run
    }
}
