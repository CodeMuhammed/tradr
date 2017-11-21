let BTCBalance = 0;
let USDBalance = 1000.00;

const trade = (candle) => {
    if (candle.trend === 'up') {
        buyBTC(candle);
    } else {
        sellBTC(candle);
    }
}

const resetBalance = () => {
    USDBalance = 1000.00;
    BTCBalance = 0;
}

const buyBTC = (candle) => {
    USDBalance = USDBalance - fees(USDBalance);
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

const fees = (amount) => {
    return (0.25 / 100) * amount;
}

module.exports = {
    trade,
    report,
    resetBalance
}
