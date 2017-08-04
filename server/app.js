// import ticker model
const Candlestick = require('./models/candlestick');
const helper = require('./helper');

const run = () => {
    helper.currentTimestamp((timestamp) => {
        let days = 3 * 24 * 3600;
        timestamp = timestamp - days;

        // delete all data older than 30days
        Candlestick.remove({
            timestamp: { $lte: timestamp }
        }, (err, stats) => {
            if (err) {
                throw new Error('Cannot truncate dataset');
            } else {
                require('./tickerService')();

                // @TODO create a watcher module instead
                let MAService = require('./maService')(20, 10, 15);

                MAService.on('cross', (message) => {
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
