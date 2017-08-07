const request = require('request');
const Candlestick = require('./models/candlestick');

// This function calculates the highest and lowest prices from the dataset
let calculatePriceMinMax = (dataset) => {
    let result = {
        minPrice: dataset[0].price_str || '0.00',
        maxPrice: dataset[0].price_str || '0.00'
    };

    if (dataset.length > 0) {
        dataset.forEach((data) => {
            if (parseFloat(data.price_str) < parseFloat(result.minPrice)) {
                result.minPrice = data.price_str
            } else if (parseFloat(data.price_str) > parseFloat(result.minPrice)) {
                result.maxPrice = data.price_str
            }
        });
    }

    return result;
}

// This function calculates the volume traded from the dataset
let getVolumeTraded = (dataset) => {
    let result = 0.00;

    dataset.forEach((data) => {
        result += parseFloat(data.amount);
    });

    return result;
}

// This calculates the candle values from the dataset
let getCandle = (dataset) => {
    let priceRange = calculatePriceMinMax(dataset);
    let volume = getVolumeTraded(dataset);

    return {
        open: dataset[0].price_str,
        close: dataset[dataset.length - 1].price_str,
        high: priceRange.maxPrice,
        low: priceRange.minPrice,
        volume,
        timestamp: dataset[dataset.length - 1].timestamp, // Unix timestamp date and time in seconds.
        amount: volume,
        price_str: dataset[dataset.length - 1].price_str
    };
}

// This returns the current time from the market
let currentTimestamp = (cb) => {
    request('https://www.bitstamp.net/api/ticker/', function (error, response, data) {
        if (error) {
            console.log(error);
            throw new Error('Cannot retrieve current time from exchange');
        } else {
            if (response && response.statusCode === 200) {
                data = JSON.parse(data);
                let timestamp = parseInt(data.timestamp);
                cb(timestamp);
            }
        }
    });
}

// This function group the candles into ${size}mins candles
let groupCandles = (dataset, size) => {
    console.log(`grouping ${dataset.length} candles`);
    let result = [];

    if (size <= dataset.length) {
        // group candles into ${size} mins sticks
        for (let i = 0; i < dataset.length;) {
            let group = dataset.slice(i, i + size);
            let candle = getCandle(group);
            result.push(candle);
            i += size;
        }
    }

    return result;
}

// This function hits the database and returns the candle sticks
let getCandles = (timestamp, size, cb) => {
    Candlestick.find({timestamp: { $gt: timestamp }}, (err, docs) => {
        if (err) {
            throw new Error('Could not initialize moving average service');
        } else {
            // truncate the last portion that are not up to 30 candles
            let extraCandles = docs.length % size;
            docs = docs.splice(0, docs.length - extraCandles);
            if (docs.length > 0) {
                cb(docs);
            } else {
                cb();
            }
        }
    });
}

module.exports = {
    getCandle,
    currentTimestamp,
    groupCandles,
    getCandles
};
