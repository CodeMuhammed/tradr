const Trade = require('../models/trade');
const Bitstamp = require('bitstamp');
const ticker = require('./tickerService');
const key = process.env.bitstamp_key;
const secret = process.env.bitstamp_secret;
const clientId = process.env.bitstamp_client_id;
const timeout = 1000;
const market = 'btcusd';

const myBitstamp = new Bitstamp(key, secret, clientId, timeout);

let tradeValidatorFn;
let tradeObj = {
    entryPrice: '',
    entryTimestamp: 0,
    exitPrice: '',
    exitTimestamp: 0,
    status: ''
};

let usdBalance;
let btcBalance;
let currentBtcPrice = 0.00;
let defaultBtcReserve = 0.001;

ticker.events.on('data', (data) => {
    currentBtcPrice = data.price || 0.00;
});

const amountToTrade = (amount, action) => {
    if (action == 'sell') {
        return btcBalance;
    } else {
        let btcAmount = (parseFloat(amount / currentBtcPrice).toFixed(3)) - defaultBtcReserve;
        return currentBtcPrice > 0 ? btcAmount : 0.00;
    }
}

const getBalance = (callback) => {
    myBitstamp.balance(null, (err, balances) => {
        if (err) {
            // Send email to developers @restart or @retry
            console.log(err)
            console.log(`Could not get balance from Bitstamp`);
        } else {
            usdBalance = balances.usd_available;
            btcBalance = balances.btc_available;

            console.log('BTC: ', btcBalance);
            console.log('USD: ', usdBalance);
            console.log(`balance operation successful`);

            callback();
        }
    })
};

const getOpenedTrade = () => {
    // Find opened trade in DB
    Trade.findOne({ status: 'opened' }, (err, data) => {
        if (err) {
            // Send email to developers @restart or @retry
            console.log(`Unable to query trade DB`);
        } else {
            if (data) {
                validateTrade(data);
            } else {
                console.log('No opened trades');
                // @TODO we may want to use this opportunity to trim the candles down
            }
        }
    })
};

const validateTrade = (trade) => {
    if (tradeValidatorFn.isValid(trade.entryTimestamp)) {
        console.log('Trade is still valid');
        tradeObj = trade;
    } else {
        console.log('Trade invalid closing position');
        sellMarket({})
            .then((stat) => {
                console.log(stat);
            }, (err) => {
                console.log(err);
            });
    }
}

const buyMarket = (candle) => {
    console.log('Buying');
    return new Promise((resolve, reject) => {
        let amount = amountToTrade(usdBalance, 'buy');

        myBitstamp.buyMarket(market, amount, (err, res) => {
            if (err || res.status == 'error') {
                reject(err || res);
            } else {
                tradeObj.entryPrice = res.price || 0;
                tradeObj.entryTimestamp = candle.timestamp;
                tradeObj.status = 'opened';

                const tradeData = new Trade(tradeObj);
                tradeData.save((err, stat) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            }
        });
    });
};

const sellMarket = (candle) => {
    console.log('Selling');
    let amount = amountToTrade(btcBalance, 'sell');

    return new Promise((resolve, reject) => {
        myBitstamp.sellMarket(market, amount, (err, res) => {
            if (err || res.status == 'error') {
                reject(err || res);
            } else {
                console.log('hrere');
                tradeObj.exitPrice = res.price || 0;
                tradeObj.exitTimestamp = candle.timestamp || 0;
                tradeObj.status = 'closed';

                Trade.update({ _id: tradeObj._id }, tradeObj, (err, stat) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
            }
        });
    });
};

const trade = (candle) => {
    console.log('========================>>');
    console.log(tradeObj);
    console.log(candle);
    console.log('========================>>');

    return new Promise((resolve, reject) => {
        let buy = !tradeObj.status && candle.trend == 'up';
        let sell = tradeObj.status && candle.trend == 'down';

        if (buy) {
            buyMarket(candle)
                .then(
                    (stats) => {
                        return resolve(stats);
                    },
                    (err) => {
                        return reject(err);
                    }
                );
        }

        if (sell) {
            sellMarket(candle)
                .then(
                    (stats) => {
                        return resolve(stats);
                    },
                    (err) => {
                        return reject(err);
                    }
                );
        }

        if (!buy && !sell) {
            return reject(new Error('Invalid trade'));
        }
    });
};

const init = () => {
    getBalance(() => {
        getOpenedTrade();
    });
}

module.exports = (tradeValidator) => {
    init();
    tradeValidatorFn = tradeValidator;

    return { trade };
}
