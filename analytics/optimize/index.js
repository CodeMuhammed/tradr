const fs = require('fs');
const optimizeHelper = require('../optimize/optimizeHelper');

// Load initial configuration settings
const initialSettings = {
    MA: {
        short: 5,
        long: 100,
        candle: 5, // in minutes
        valueUpdate: 5 // increment short and long MA
    }
};

// Create variable to hold trade data and analysis
let tradeJsonData = {};
let analysis = [];
const filePath = 'analytics/optimize/tradeData.json';
const analysisFilePath = 'analytics/optimize/analysisData.json';

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
    let candle = initialSettings.MA.candle;
    // Fetch new trade data from helper
    optimizeHelper.generateTradeData(candle, data => {
        const tradeJSON = JSON.stringify(data, null, 2);
        fs.writeFile(filePath, tradeJSON, (err) => {
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

// Method to output analysis to json file
let outputAnalysis = () => {
    const analysisJSON = JSON.stringify(analysis, null, 2);
    fs.writeFileSync(analysisFilePath, analysisJSON);
}

// Method to run analysis using the loaded trade data
let runAnalysis = () => {
    // Load initial settings
    const short = initialSettings.MA.short;
    const long = initialSettings.MA.long;
    const valueUpdate = initialSettings.MA.valueUpdate;
    // Calculate the moving average for each candle stick
    function run () {
        for (let i = short; i < long; i += valueUpdate) {
            for (let j = long; j > short; j -= valueUpdate) {
                let settings = {short: i, long: j}
                let tradeObj = optimizeHelper.mapMovingAverages(tradeJsonData, settings);
                let analysisresult = optimizeHelper.analyzeCrosses(tradeObj, settings);
                analysis.push(analysisresult);
            }
        }
    }

    // Run the trade analysis
    run();

    // @TODO: implement candle change to run analysis for different candle data

    // Output analysis file
    outputAnalysis();

    process.exit();
};

// Start optimization script process
let startAnalysis = () => {
    /** Process:
    - Unload/Delete prior trade data: unlinkTradeData()
    - Pull recent trade data: getTradeData()
    - Load recently pulled trade data: loadTradeData()
    - Run analysis using the loaded trade data: runAnalysis()
    - Output analysis data to JSON: outputAnalysis()
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
