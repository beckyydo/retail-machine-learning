d3.csv("/data/stockpredictions.csv", function(data) {
    console.log(data);
})

var dates = []
dates.forEach(function(dataPoint) {
    dates.push(dataPoint.ds);
    console.log(dates);
});

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