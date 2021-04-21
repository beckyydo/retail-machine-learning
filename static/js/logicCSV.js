var xField = 'Date';
var yfield = 'Adj Close';

var selectorOptions = {
    buttons: [{
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1m'
    }, {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6m'
    }, {
        step: 'year',
        stepmode: 'todate',
        count: 1,
        label: 'YTD'
    }, {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1y'
    }, {
        step: 'all',
    }],
};

d3.csv("/prophet_data.csv", function(data) {
    console.log(data);

    var data2 = prepData(data);
    var layout = {
        title: 'Time series with range slider and selectors',
        xaxis: {
            rangeselector: selectorOptions,
            rangeslider: {}
        },
        yaxis: {
            fixedrange: true
        }
    };

    Plotly.newPlot('plot-forecast', data2, layout);
});

function prepData(data2) {
    var x = [];
    var y = [];

    data2.forEach(function(datum, i) {

        x.push(new Date(datum[xField]));
        y.push(datum[yField]);
    });

    return [{
        mode: 'lines',
        x: x,
        y: y
    }];
}

// var dates = []
// dates.forEach(function(dataPoint) {
//     dates.push(dataPoint.ds);
//     console.log(dates);
// });

// var actualPrice = data.trend

// var trace1 = {
//     fill: null,
//     mode: 'markers',
//     name: 'Actual Stock Price',
//     x: dates,
//     y: actualPrice
// };

// var data = [trace1];

// var layout = {
//     title: 'WMT Time Series Forecast',
//     xaxis: {
//         title: 'Monthly Dates', 
//         ticklen: 5, 
//         gridcolor: 'rgb(255, 255, 255)', 
//         gridwidth: 2, 
//         zerolinewidth: 1
//     }, 
//     yaxis: {
//         title: 'Pageviews', 
//         ticklen: 5, 
//         gridcolor: 'rgb(255, 255, 255)', 
//         gridwidth: 2, 
//         zerolinewidth: 1
//     }, 
//     plot_bgcolor: 'rgb(243, 243, 243)', 
//     paper_bgcolor: 'rgb(243, 243, 243)'
// };

// Plotly.newPlot('plot', data, layout);