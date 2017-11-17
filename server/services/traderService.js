const Trade = require('../models/trade');
const Bitstamp = require('bitstamp');
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

const getBalance = () => {
    myBitstamp.balance(null, (err, balances) => {
        if (err) {
            // Send email to developers
            console.log(err)
            console.log(`Could not get balance from Bitstamp`);
        } else {
            usdBalance = balances.usd_available;
            btcBalance = balances.btc_available;
            console.log(`balance operation successful`);
        }
    })
};

const getOpenedTrade = () => {
    // Find opened trade in DB
    Trade.findOne({ status: 'opened' }, (err, data) => {
        if (err) {
            console.log(`Unable to query trade DB`);
            // Send us Email
        } else {
            if (data) {
                validateTrade(data);
            } else {
                console.log('No opened trades');
            }
        }
    })
};

const validateTrade = (tradeObject) => {
    if (tradeValidatorFn.isValid(tradeObj.entryTimeStamp)) {
        tradeObj = tradeObject;
    } else {
        sellMarket({});
    }
}

const buyMarket = (candle) => {
    // Buy market
    return new Promise((resolve, reject) => {
        myBitstamp.buyMarket(market, usdBalance, (err, res) => {
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
    // Sell market 
    return new Promise((resolve, reject) => {
        myBitstamp.sellMarket(market, btcBalance, (err, res) => {
            if (err || res.status == 'error') {
                reject(err || res);
            } else {
                tradeObj.exitPrice = res.price || 0;
                tradeObj.exitTimestamp = candle.timestamp;
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
    return new Promise((resolve, reject) => {
        let buy = !tradeObj.status && candle.trend == 'up';
        let sell = tradeObj.status && candle.trend == 'down';

        if (buy) {
            console.log('buying');
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
            console.log('selling');
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
    getBalance();
    getOpenedTrade();
}

module.exports = (tradeValidator) => {
    tradeValidatorFn = tradeValidator;
    init();
    return { trade };
}
