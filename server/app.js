const Candlestick = require('./models/candlestick');
const helper = require('./helper');
const settings = require('./settings');
const ticker = require('./services/tickerService');
const cronJob = require('./services/cronjobService');
const MAService = require('./services/maService')(settings.MA);
const traderService = require('./services/traderService');
const trader = require('./services/traderService')(MAService.tradeValidator);

const run = () => {
    ticker.tick();
    trader.init();
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
                    setTimeout(() => {
                        trader.trade(candle)
                            .then(
                                (stats) => {
                                    console.log('Trade operation successful', candle.trend);
                                    console.log(stats);
                                },
                                (err) => {
                                    console.log(err);
                                }
                            );
                    }, 5000);
                });
            }
        });
    });
}

module.exports = { run };
