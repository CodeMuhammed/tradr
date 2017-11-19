const Pusher = require('pusher-client');
const Candlestick = require('../models/candlestick');
const helper = require('../helper');
const BITSTAMP_PUSHER_KEY = 'de504dc5763aeef9ff52';
const EventEmitter = require('events').EventEmitter;
const moduleEvents = new EventEmitter;

let latestDataset = [];
let bitstamp = new Pusher(BITSTAMP_PUSHER_KEY, {
    encrypted: true
});

bitstamp.subscribe('live_trades');
bitstamp.bind('trade', (e) => {
    latestDataset.push(e);
    moduleEvents.emit('data', e);
});

let tick = () => {
    console.log('Ticker started');
    // calculate the low high open, close, volume then reset the dataset
    // At 1 min intervals
    setInterval(() => {
        if (latestDataset.length > 0) {
            let candleStick = helper.getCandle(latestDataset);

            // save data to the database
            Candlestick.create(candleStick, (err, info) => {
                if (err) {
                    console.log('Could not create candle');
                }
            });
        }
        latestDataset = [];
    }, (1000 * 60));
};

module.exports = {
    tick,
    events: moduleEvents
};
