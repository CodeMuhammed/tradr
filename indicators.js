// This is the main moving average class
class MA {
    constructor(period) {
        this.dataset = [];
        this.movingAverages = [];
        this.period = period || 1;
        this.lastSum = 0.00;
    }
    
    // calculates the next moving average and returns it
    getNextAverage(value) {
        let result = 0.00;
        this.dataset.push(value);
        if(this.dataset.length === this.period) {
            this.dataset.forEach((data) => {
                this.lastSum += parseFloat(data);
            });
            result = this.lastSum / this.period;
        } else if(this.dataset.length > this.period) {
            this.lastSum = this.lastSum - this.dataset[0] + value;
            this.dataset.splice(0, 1);
            result = this.lastSum / this.period;
        }
        
        if(this.dataset.length >= this.period) {
            this.movingAverages.push(result);
        }
        return result;
    }

    // return all the averages calculated so far
    getAllAverages() {
        return this.movingAverages;
    }
}

module.exports = {
    MA: MA
}