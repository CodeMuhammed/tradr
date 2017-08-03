// import ticker model
const Candlestick = require('./models/candlestick');

const run = () => {
    require('./tickerService')();
    let MAService = require('./maService');

    MAService.on('cross', (message) => {
        console.log(message);
    });
}

module.exports = () => {
    return {
        run
    }
}
