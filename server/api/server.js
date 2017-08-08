const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const methodOverride = require('method-override');
const path = require('path');
const Candlestick = require('../models/candlestick');
const app = express();
const port = parseInt(process.env.PORT, 10) || 8001;

app.set('port', port);

// cors
app.use(cors());

// Log requests to the console.
app.use(logger('dev'));

// Categorize CRUD request corectly
app.use(methodOverride('_method'));

// Parse incoming request's data.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use('/', express.static('client/build'));
app.use('/ping', (req, res) => {
    res.status(200).send({msg: 'yes'});
});
app.use('/data', (req, res) => {
    Candlestick.find().sort({timestamp: 1}).find((err, docs) => {
        if (err) {
            res.status(500).send({msg: err});
        } else {
            res.status(200).send({msg: docs});
        }
    });
});

module.exports = {
    start: (cb) => {
        const server = http.createServer(app);

        server.listen(port, () => {
            console.log(`Server listening on port: ${port}`);
            cb();
        });
    }
};
