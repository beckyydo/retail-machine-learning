

function init(){
  d3.json("/api/stock").then(function(data){
    console.log(data);
    // Assign the data from `data.js` to a descriptive variable
    
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
    var equation = data.map(record=>record.equation);
     
    console.log(volumeClose)
    var trace1 = {
      name: 'Sum of Upvotes Vs. Close price', 
      type: 'scatter', 
      x: score, 
      y: adjustClosing, 
      mode:'markers'
    };
    var trace2 = {
      name: 'y=0.00131x+132.885', 
      x: score,
      y: equation,
      mode: 'lines',
      type: 'scatter'
    };
    

    var data = [trace1, trace2];
    var layout = {
      title: {
        text:'Walmart Sum of Upvotes Vs. Close price',
        font: {
          family: 'Courier New, monospace',
          size: 24
        },
        xref: 'paper',
        x: 0.05,
      },
      xaxis: {
        title: {
          text: 'Sum of Upvotes',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: 'Close Price',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    };
    
    Plotly.newPlot('plot', data, layout);
  });
};

