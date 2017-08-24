const request = require('request');

function ping () {
    request('http://stocktradr.herokuapp.com/ping', function (error, response, data) {
        if (error) {
            throw new Error('Cannot ping site');
        } else {
            console.log('Pinged');
        }
    });
}

ping();

setInterval(() => {
    ping();
}, 10 * 60 * 1000);
