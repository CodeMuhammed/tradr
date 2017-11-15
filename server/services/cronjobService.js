const request = require('request');

function ping () {
    request('http://stocktradr.herokuapp.com/ping', (error, response, data) => {
        if (error) {
            throw new Error('Cannot ping site');
        } else {
            console.log('Pinged');
        }
    });
}

let start = () => {
    console.log('cron job started started');
    setInterval(() => {
        ping();
    }, 10 * 60 * 1000);
}

module.exports = { start };
