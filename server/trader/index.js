let BTCBalance = 1;
let USDBalance = 0.00;

const trade = (candle) => {
    let offset = new Date().getTimezoneOffset() * 60;
    let timestamp = candle.timestamp - offset;
    let date = new Date(timestamp * 1000).toUTCString();

    console.log(`At ${date}`);
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
