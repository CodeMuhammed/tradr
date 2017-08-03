// This function calculates the highest and lowest prices from the dataset
let calculatePriceMinMax = (dataset) => {
    let result = {
        minPrice: dataset[0].price_str || '0.00',
        maxPrice: dataset[0].price_str || '0.00'
    };

    if(dataset.length > 0) {
        dataset.forEach((data) => {
            if(parseFloat(data.price_str) < parseFloat(result.minPrice)) {
                result.minPrice = data.price_str
            } else if(parseFloat(data.price_str) > parseFloat(result.minPrice)) {
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

// This function calculates the moving average from the dataset
let getMovingAverage = (dataset) => {
    return 0.00;
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


module.exports = {
    getCandle,
    getMovingAverage
};