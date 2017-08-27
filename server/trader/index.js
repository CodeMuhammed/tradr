let BTCBalance = 0;
let USDBalance = 1000.00;

const trade = (candle) => {
    if (candle.trend === 'up') {
        buyBTC(candle);
    } else {
        sellBTC(candle);
    }
}

const buyBTC = (candle) => {
    let BTC = USDBalance / candle.close;
    BTCBalance += BTC;
    USDBalance = 0.00;
}

const sellBTC = (candle) => {
    let USD = candle.close * BTCBalance;
    USDBalance += USD;
    BTCBalance = 0.00;
}

const report = () => {
    return {
        BTC: BTCBalance,
        USD: USDBalance
    };
}

module.exports = {
    trade,
    report
}
