require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./server/app');
const server = require('./server/api/server');

// database url read from the environment variables
const dbUrl = process.env.db_url_dev || process.env.db_url_prod;

// connect to mongoose here
mongoose
    .connect(dbUrl, { useMongoClient: true })
    .then(() => {
        console.log('connected successfully to the database');
        server.start(() => {
            app.run();
        });
    })
    .catch(err => console.error(err));
