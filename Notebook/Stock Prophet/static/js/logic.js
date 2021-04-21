// Forecast Chart
const url = '/api/prophet';

  d3.json(url).then(function(data) {
    // console.log(data);
    
    let dataTable = data;

    var dates = data.map(record => record.ds);
    // console.log(dates);

    var xField = []
    dates.forEach(function(date, i){
      let d = new Date(dates[i]);
      let str = d.toJSON().slice(0,10);
      // console.log(str);
      
      xField.push(str)
    })

    // console.log(xField)
    

    var trend = data.map(record => record.trend);
    var yhat_lower = data.map(record => record.yhat_lower);
    var yhat_upper = data.map(record => record.yhat_upper);
    var trend_lower = data.map(record => record.trend_lower);
    var trend_upper = data.map(record => record.trend_upper);
    var additive_terms = data.map(record => record.additive_terms);
    var additive_terms_lower = data.map(record => additive_terms_lower);
    var additive_terms_upper = data.map(record => record.additive_terms_upper);
    var daily = data.map(record => record.daily);
    var daily_lower = data.map(record => record.daily_lower);
    var daily_upper = data.map(record => record.daily_upper);
    var weekly = data.map(record => record.weekly);
    var weekly_lower = data.map(record => record.weekly_lower);
    var weekly_upper = data.map(record => record.weekly_upper);
    var yearly = data.map(record => record.yearly);
    var yearly_lower = data.map(record => record.yearly_lower);
    var yearly_upper = data.map(record => record.yearly_upper);
    var yhat = data.map(record => record.yhat);
    var actual = data.map(record => record.y);

    var trace1 = {
    fill: null,
    mode:'markers',
    marker: {
        color: 'rgb(4,31,65)',
        line: {color: 'white'}
      },
    name:'predicted price',
    type:'scatter',
    x: xField,
    y: yhat
    };

    var trace2 = {
      fill: 'tonexty',
      line: {color:'#57b8ff'},
      mode:'lines',
      name: 'upper_band',
      type:'scatter',
      x:xField,
      y: yhat_upper
    };

    var trace3 = {
      fill: 'tonexty', 
      line: {color: '#57b8ff'}, 
      mode: 'lines', 
      name: 'lower_band', 
      type: 'scatter', 
      x: xField,
      y: yhat_lower
    };

    var trace4 = {
      line: {color: '##ff6d22'}, 
      mode: 'lines', 
      name: 'model line of best fit', 
      type: 'scatter', 
      x: xField,
      y: trend
    };

    var trace5 = {
      fill: null,
      mode:'markers',
      marker: {
        color: 'rgb(235,20,141)',
        line: {color: 'rgb(235,20,141)', width: 0.5},
        symbol: 'square',
        size: 8
      },
      name:'actual price',
      type:'scatter',
      x: xField,
      y: actual
    };

    var traceData = [trace1,trace2,trace3,trace4,trace5];

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

    var layout = {
      title: 'Walmart Stock Time Series Forecast', 
      xaxis: {
        title: 'Dates', 
        ticklen: 5,
        showticklabels: true, 
        gridcolor: 'rgb(255, 194, 32)', 
        gridwidth: 2, 
        zerolinewidth: 1,
        rangeselector: selectorOptions,
        rangeslider: {},
        type:'date'
      }, 
      yaxis: {
        title: 'Price (USD)', 
        ticklen: 5, 
        gridcolor: 'rgb(255, 194, 32)', 
        gridwidth: 2, 
        zerolinewidth: 1,
        fixedrange: true
      }, 
      plot_bgcolor: 'rgb(255,255,255)' 
      // paper_bgcolor: 'rgb(243, 243, 243)'
  };

Plotly.newPlot('plot-forecast', traceData, layout);
});



  