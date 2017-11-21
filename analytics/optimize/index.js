const fs = require('fs');
const optimizeHelper = require('../optimize/optimizeHelper');

// Load initial configuration settings
const initialSettings = {
    MA: {
        short: 1,
        long: 10,
        candle: 5 // in minutes
    }
};

// Create variable to hold trade data
let tradeJsonData = {};
const filePath = 'analytics/optimize/tradeData.json';

// Method to unlink already saved trade data
let unlinkTradeData = () => {
    fs.readFile(filePath, (err, data) => {
        if (!err) {
            fs.unlinkSync(filePath);
            console.log('Trade data removed')
        } else {
            console.log('No trade data to remove')
        }
    })
};

// Method to pull data and write to JSON file
let getTradeData = () => {
    // Fetch new trade data from helper
    optimizeHelper.generateTradeData(data => {
        const tradeJSON = JSON.stringify(data, null, 2);
        fs.writeFile('analytics/optimize/tradeData.json', tradeJSON, (err) => {
            if (!err) {
                console.log('Trade Data Generated');
                process.nextTick(runAnalysis);
            } else {
                console.log(err)
            }
        })
    })
};

// Method to load JSON data
let loadTradeData = () => {
    fs.readFile(filePath, (err, data) => {
        if (!err) {
            tradeJsonData = JSON.parse(data);
            console.log('Trade data loaded');
        } else {
            console.log('No trade data found')
        }
    })
};

// Method to run analysis using the loaded trade data
let runAnalysis = () => {
    // console.log('trade Data:::', tradeJsonData);
    // We have the loaded trade data here, hence we proceed with the analysis
    process.exit();
};

// Start optimization process
let startAnalysis = () => {
    /** Process:
    - Unload/Delete prior trade data: unlinkTradeData()
    - Pull recent trade data: getTradeData()
    - Load recently pulled trade data: loadTradeData()
    - Run analysis using the loaded trade data: runAnalysis()
    **/

    let p1 = new Promise(resolve => {
        resolve(unlinkTradeData());
    });
    let p2 = new Promise(resolve => {
        resolve(getTradeData());
    });
    let p3 = new Promise(resolve => {
        resolve(loadTradeData());
    });

    Promise.all(p1, p2, p3);
};

// Run analysis after all is done;

startAnalysis();
