const request = require('request');
const EventEmitter = require('events').EventEmitter;
const moduleEvents = new EventEmitter;
const Candlestick = require('./models/candlestick');
const helper = require('./helper');
const MA = require('./indicators').MA;
const mailer = require('./emailService');

const MA_PERIODS = {
    long: 20,
    short: 10
};
const shortMA = new MA(MA_PERIODS.short);
const longMA = new MA(MA_PERIODS.long);
const CHUNKSIZE = 10;

let candleData = [];
let lastCandleTimeStamp = '';

// Get current ticker timestamp from bitstamp, then backdate it 48hours
request('https://www.bitstamp.net/api/ticker/', function (error, response, data) {
    if(error) {
        console.log('An error occured trying to retrieve data');
    } else {
        if(response && response.statusCode === 200) {
            data = JSON.parse(data);
            let timestamp = parseInt(data.timestamp) - (48 * 3600);
            
            getCandles(timestamp, (docs) => {
                let sampleCandles  = groupCandles(docs);
                mapMovingAverages(sampleCandles);
                candleData = sampleCandles;
                runCron();
            })
        }
    }
});

// This function hits the database and returns the candle sticks
function getCandles(timestamp, cb) {
    Candlestick.find({timestamp: { $gt: timestamp }}, (err, docs) => {
        if (err) {
            throw new Error('Could not initialize moving average service');
        } else {
            // truncate the last portion that are not up to 30 candles
            let extraCandles = docs.length % CHUNKSIZE;
            docs = docs.splice(0, docs.length - extraCandles);
            if(docs.length > 0) {
                cb(docs);
            } 
        }
    });
}

// This function group the candles into 30mins candles
function groupCandles(dataset) {
    console.log('about to group candles', dataset.length);
    let result  = [];
    // group candles into ${CHUNKSIZE} mins sticks
    for(let i = 0; i < dataset.length;) {
        let group  = dataset.slice(i, i + CHUNKSIZE);
        let candle = helper.getCandle(group);
        result.push(candle);
        i += CHUNKSIZE;
    }
    
    lastCandleTimeStamp = dataset[dataset.length - 1].timestamp;
    return result;
}

// This function calculates the moving average for each candle stick
function mapMovingAverages(sampleCandles) {
    if(sampleCandles.length > MA_PERIODS.long) {
        // calculates all moving averages
        sampleCandles = sampleCandles.map((candle) => {
            candle.shortMA = shortMA.getNextAverage(parseFloat(candle.close));
            candle.longMA = longMA.getNextAverage(parseFloat(candle.close));
            
            return candle;
        });
    } else {
        console.log('not enough data to calculate moving averages');
    }
}

// This cron job calculates the latest moving average every 30mins
function runCron() {
    console.log(candleData);
    setTimeout(() => {
        getCandles(lastCandleTimeStamp, (docs) => {
            let sampleCandles  = groupCandles(docs);
            mapMovingAverages(sampleCandles);
            candleData = candleData.concat(sampleCandles);
            
            // check if the recently added candles have an intersection
            let message;
            for(let i = 0; i < sampleCandles.length; i++) {
                if(sampleCandles[i].longMA > sampleCandles[i].shortMA) {
                    message = 'Sell your position now prices are falling';
                } else if(sampleCandles[i].longMA < sampleCandles[i].shortMA) {
                    message = 'buy your position now prices are rising';
                }
            }

            if(message) {
                mailer.sendEmail(
                    `
                     <b>${message}</b> <br />
                     <b>Current BTC price : ${sampleCandles[sampleCandles.length -1 ].close}</b> 
                    `,
                    'codemuhammed@gmail.com',
                    'Tradr Alert',
                    (err, info) => {
                        console.log(err || info);
                    }
                );
            }
        })
    }, (10 * 60 * 1000));
}

module.exports = moduleEvents;