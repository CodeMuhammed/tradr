// import ticker model
const Candlestick = require('./models/candlestick');

const run = () => {
   require('./tickerService')();
   let movingAverageService = require('./maService');

   // @TODO create a moving average service and add the event listeners
   // that allows you to listen for intersections
}

module.exports = () => {
    return {
        run
    }
}