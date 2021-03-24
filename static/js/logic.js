const url = ("/api/stock")

// Load data

d3.json(url).then(function(data){
    console.log(data);
});

var dates = data.map(data => data.date);
var closingPrices = data.map(data => data.closingPrice);

var trace = {
  type: "scatter",
  mode: "lines",
  x: dates,
  y: closingPrices,
  line: {
    color: "#17BECF"
      }
};

var data = [trace];

var layout = {
      title: `WMT closing prices`,
      xaxis: {
        range: [startDate, endDate],
        type: "date"
      },
      yaxis: {
        autorange: true,
        type: "linear"
      }
    };

Plotly.newPlot("plot", data, layout)


