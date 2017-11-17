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
    status: '',
};

let usdBalance;
let btcBalance;

const getBalance = () => {
    myBitstamp.balance(null, (err, balances) => {
        if(err) {
            // Send email to developers
            console.log(err)
            console.log(`Could not get balance from Bitstamp`);
        }
        usdBalance = balances.usd_available;
        btcBalance = balances.btc_available;
        console.log(`balance operation successful`);
    })
};

const getOpenedTrade = () => {
    // Find opened trade in DB
    Trade.findOne({ status: 'opened'}, (err, data) => {
        if(err) {
            console.log(`Unable to query trade DB`);
            // Send us Email
        } else {
            if(data) {
                validateTrade(data);
            } else {
                console.log('here', data);
            }
        }
    })
};

const validateTrade = (tradeObject) => {
    if(tradeValidatorFn.isValid(tradeObj.entryTimeStamp)) {
        tradeObj = tradeObject;
    } else {
        sellMarket({});
    }
}

const buyMarket = (candle) => {
    // Buy market
    myBitstamp.buyMarket(market, usdBalance, (err, res) => {
        if(err && res.status == 'error') {
            console.log('Unable to buy asset');
        } else {
            console.log('BTC purchased');
            console.log(res);

            tradeObj.entryPrice = res.price || 0;
            tradeObj.entryTimestamp = candle.timestamp;
            tradeObj.status = 'opened';

            const tradeData = new Trade(tradeObj);
            tradeData.save((err, res) => {
                if (err) {
                    console.log('Could not save trade data');
                } else {
                    tradeObj = res;
                    console.log('Trade data saved');
                }
            });
        }
    });
}

const sellMarket = (candle) => {
    // Sell market 
    myBitstamp.sellMarket(market, btcBalance, (err, res) => {
        if(err && res.status == 'error') {
            console.log(err);
            console.log(`Unable to sell BTC`);
        } else {
            console.log(`BTC sold`);
            console.log(res);

            tradeObj.exitPrice = res.price || 0;
            tradeObj.exitTimestamp = candle.timestamp;
            tradeObj.status = 'closed';
            console.log(candle)
            console.log(tradeObj);

            Trade.update({ _id: tradeObj._id }, tradeObj, (err, res) => {
                if(err) {
                    console.log(err);
                    console.log(`Unable to update the trade`);
                } else {
                    console.log(`Trade updated`);
                }
            })
        }
    });
};

const trade = (candle) => {
    if(!tradeObj.status && candle.trend == 'up') {
        buyMarket(candle);
    }

    if(tradeObj.status && candle.trend == 'down') {
        sellMarket(candle);
    }
};

const init = () =>{
    console.log(`Getting Here`)
    getBalance();
    getOpenedTrade();
}

module.exports = (validatorFn) => {
    tradeValidatorFn = validatorFn;
    init();
    return { trade } 
}

