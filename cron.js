const request = require('request');

function ping () {
    request('http://stocktradr.herokuapp.com/', function (error, response, data) {
        if (error) {
            throw new Error('Cannot ping site');
        } else {
            console.log(data);
        }
    });
}

ping();

setInterval(() => {
    ping();
}, 10 * 60 * 1000);


// @TODO get all the data and crunch for intersections
