const Candlestick = require('./models/candlestick');
const helper = require('./helper');
const settings = require('./settings');
const ticker = require('./services/tickerService');
const cronJob = require('./services/cronjobService');
const MAService = require('./services/maService')(settings.MA);
const traderService = require('./services/traderService');

const run = () => {
    MAService.init(() => {
        const trader = traderService(MAService.tradeValidator);
        ticker.tick();
        cronJob.start();

        MAService.events.on('cross', (candle) => {
            console.log('Cross Registered =>>>>>>>>>>>>>>>>>>');
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
    });
}

module.exports = { run: () => {} };
