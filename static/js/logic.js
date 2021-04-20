// Forecast Chart
const url = '/api/prophet'

d3.json(url).then(function(data) {
  console.log(data);

  var dates = data.map(record => record.ds);
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
    fill: 'green',
    mode:'markers',
    name:'actual price',
    type:'scatter',
    x: dates,
    y: actual
  };

  var traceData = [trace1,trace2,trace3,trace4,trace5];

  var layout = {
    title: 'WMT Times Series Forecast', 
    xaxis: {
      title: 'Dates', 
      ticklen: 5,
      showticklabels: false, 
      gridcolor: 'rgb(255, 255, 255)', 
      gridwidth: 2, 
      zerolinewidth: 1
    }, 
    yaxis: {
      title: 'Price (USD)', 
      ticklen: 5, 
      gridcolor: 'rgb(255, 255, 255)', 
      gridwidth: 2, 
      zerolinewidth: 1
    }, 
    plot_bgcolor: 'rgb(243, 243, 243)', 
    paper_bgcolor: 'rgb(243, 243, 243)'
  };

Plotly.newPlot('plot-forecast', traceData, layout);
});