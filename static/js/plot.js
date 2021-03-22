

function init(){
  d3.json("/api/stock").then(function(data){
    console.log(data);
    // Assign the data from `data.js` to a descriptive variable
    let tableData = data;
    console.log(tableData)

    var dates= data.map(record=>record.dates);
    var score= data.map(record=>record.score);
    var comments=data.map(record=>record.comments);
    var openingPrices = data.map(record=>record.openingPrices);
    var highPrices = data.map(record=>record.highPrices);
    var lowPrices = data.map(record=>record.lowPrices);
    var closingPrices = data.map(record=>record.closingPrices);
    var adjustClosing = data.map(record=>record.adjustClosing);
    var volume= data.map(record=> parseInt(record.volume))
    var percentChange = data.map(record=>record.percentChange);
    var movingAvg = data.map(record=>record.movingAvg);
    var priceStdv5 = data.map(record=>record.priceStdv5);
    var volumeChange = data.map(record=>record.volumeChange);
    var volumeAvg5 = data.map(record=>record.volumeAvg5);
    var volumeClose = data.map(record=>record.volumeClose);
     
    console.log(volumeClose)
    var trace1 = {
      name: 'Walmart Close price vs. sum of upvotes', 
      type: 'scatter', 
      x: score, 
      y: adjustClosing, 
      mode:'markers'
    };

    data = [trace1];
  

    
    Plotly.newPlot('plot', data);

//   });
// }


// // Create reset button
// var reset = d3.select("#reset-btn")
// reset.on("click", init)
// // Select the form and button
// var data_button = d3.select("#filter-btn");
// //var form = d3.select(".form-group");

// // Create event handlers
// data_button.on("click", runEnter);
// //form.on("submit", runEnter);

// // Complete the event handler function for the form
// function runEnter() {
//     d3.event.preventDefault();
    

//     //select the plot area
//     var plotArea = d3.select("#plot")
//     plotArea.html("")
    
//     var inputValue1 = d3.select("#datetime1").property("value");
//     var inputValue2 = d3.select("#datetime2").property("value");
//     console.log(inputValue1);
//     console.log(inputValue2);

//     //clear the search field
//     d3.select("#datetime1").property('value', "");
//     d3.select("#datetime2").property('value', "");

//    d3.json("/api/stock").then(function(tableData) {
//     var filteredData = tableData.filter(record => record.dates >= inputValue1);
//     var finalfilteredData= filteredData.filter(item=>item.dates<=inputValue2)
//     // console.log(finalfilteredData)

    
//     var dates1= finalfilteredData.map(row=>row.dates);
//     var closingPrices1 = finalfilteredData.map(row=>row.closingPrices);
//     var highPrices1 = finalfilteredData.map(row=>row.highPrices);
//     var lowPrices1 = finalfilteredData.map(row=>row.lowPrices);
//     var openingPrices1 = finalfilteredData.map(row=>row.openingPrices);
//     var volume1= finalfilteredData.map(row=> parseInt(row.volume))
//     var movingAvg1= finalfilteredData.map(row=>row.movingAvg);
//     var colors1 = finalfilteredData.map(row=>row.colors)
    
//     // console.log(dates1)

//     trace4 = {
//         name: `Walmart stock data from ${inputValue1} to ${inputValue2}`, 
//         type: 'candlestick', 
//         x: dates1, 
//         yaxis: 'y2', 
//         low: lowPrices1, 
//         high:highPrices1, 
//         open: openingPrices1, 
//         close: closingPrices1
//       };
//     trace5 = {
//         line: {width: 1}, 
//         mode: 'lines', 
//         name: 'Moving Average', 
//         type: 'scatter', 
//         x: dates1, 
//         y: movingAvg1, 
//         yaxis: 'y2', 
//         marker: {color: '#0000FF'}
//       };

//     trace6 = {
//         name: 'Volume', 
//         type: 'bar', 
//         x: dates1, 
//         y: volume1, 
//         yaxis: 'y', 
//         marker: {
//           color: colors1
//         }
//       };
    
//       data1 = [trace4, trace5, trace6];

//       layout1 = {
//         title: "Walmart Stock",
//         xaxis: {
//             rangeslider: {},
//         },
//         yaxis: {
//           domain: [0, 1], 
//           showticklabels: false
//         },  
//         yaxis2: {domain: [0.2, 1]}
     
//       };

//       Plotly.newPlot('plot', data1, layout1);
  });
};

// To DO
//Create init function ()