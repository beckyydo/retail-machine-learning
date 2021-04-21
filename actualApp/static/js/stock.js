d3.json("/api/stock_metric").then(function(data){

    var open = data.Open;
    var close = data.Close;
    var high = data.High;
    var low = data.Low;
    var volume = data.Volume;
    var dollar_format = d3.format("$.2f")

    d3.select("#stock_open").text(dollar_format(open));
    d3.select("#stock_close").text(dollar_format(close));
    d3.select("#stock_high").text(dollar_format(high));
    d3.select("#stock_low").text(dollar_format(low));
    d3.select("#stock_volume").text(volume);
});