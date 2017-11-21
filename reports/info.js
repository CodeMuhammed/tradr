require('dotenv').config();
const Bitstamp = require('bitstamp');
const key = process.env.bitstamp_key;
const secret = process.env.bitstamp_secret;
const clientId = process.env.bitstamp_client_id;
const timeout = 1000;
const myBitstamp = new Bitstamp(key, secret, clientId, timeout);

myBitstamp.balance(null, (err, response) => {
    if(err) {
        console.log(`Unable to get balance \n ${err.message}`);        
        return false;
    } else {
        console.log('BALANCES');
        console.log('==============');
        console.log(`USD: ${response.usd_available}`);        
        console.log(`BTC: ${response.btc_available}`);
        return true;        
    }
});

myBitstamp.user_transactions('btcusd', {limit: 10, sort: 'desc'}, (err, response) => {
    if(err) {
        console.log(`Unable to get transactions \n ${err.message}`);
        return false;
    } else {
        console.log('\nTRANSACTIONS');
        console.log('========================')
        response.forEach(transaction => {
            const transactionType = transaction.usd > 0.00 ? 'SELL' : 'BUY';            
            console.log(`${transaction.datetime} ${transactionType}`);
            const message = transactionType == 'BUY' ?
                `${transaction.usd}USD ==> ${transaction.btc}BTC ($${transaction.btc_usd}) \n`:
                `${transaction.btc}BTC ==> ${transaction.usd}USD ($${transaction.btc_usd}) \n`;
            console.log(message);
        });
    }
});