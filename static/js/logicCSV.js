d3.csv("/prophet_data.csv", function(data) {
    console.log(data);

    var dates = [];
    data.forEach(function(datapoint, i){
        dates.push(new Date(datapoint[ds]));
    })

    var trace1 = {
    fill: null,
    mode:'markers',
    name:'predicted price',
    type:'scatter',
    x: dates,
    y: yhat
  };

  var trace2 = {
    fill: 'tonexty',
    line: {color:'#57b8ff'},
    mode:'lines',
    name: 'upper_band',
    type:'scatter',
    x: dates,
    y: yhat_upper
  };

  var trace3 = {
    fill: 'tonexty', 
    line: {color: '#57b8ff'}, 
    mode: 'lines', 
    name: 'lower_band', 
    type: 'scatter', 
    x: dates,
    y: yhat_lower
  };

  var trace4 = {
    line: {color: '##ff6d22'}, 
    mode: 'lines', 
    name: 'model line of best fit', 
    type: 'scatter', 
    x: dates,
    y: trend
  };

  var trace5 = {
    fill: 'black',
    mode:'markers',
    name:'actual price',
    type:'scatter',
    x: dates,
    y: actual
  };

  var traceData = [trace1,trace2,trace3,trace4,trace5];

  // var selectorOptions = {
  //   buttons: [{
  //       step: 'month',
  //       stepmode: 'backward',
  //       count: 1,
  //       label: '1m'
  //   }, {
  //       step: 'month',
  //       stepmode: 'backward',
  //       count: 6,
  //       label: '6m'
  //   }, {
  //       step: 'year',
  //       stepmode: 'todate',
  //       count: 1,
  //       label: 'YTD'
  //   }, {
  //       step: 'year',
  //       stepmode: 'backward',
  //       count: 1,
  //       label: '1y'
  //   }, {
  //       step: 'all',
  //   }],
  // };

  var layout = {
    title: 'Walmart Stock Time Series Forecast', 
    xaxis: {
      title: 'Dates', 
      ticklen: 5,
      showticklabels: false, 
      gridcolor: 'rgb(255, 255, 255)', 
      gridwidth: 2, 
      zerolinewidth: 1,
      // rangeselector: selectorOptions,
      rangeslider: {}
      // type:'date'
    }, 
    yaxis: {
      title: 'Price (USD)', 
      ticklen: 5, 
      gridcolor: 'rgb(255, 255, 255)', 
      gridwidth: 2, 
      zerolinewidth: 1,
      fixedrange: true
    }, 
    plot_bgcolor: 'rgb(229, 236, 246)' 
    // paper_bgcolor: 'rgb(243, 243, 243)'
  };

Plotly.newPlot('plot-forecast', traceData, layout);
});

