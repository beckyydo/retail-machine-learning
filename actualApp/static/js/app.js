// ******************************** MONTHLY SALES ********************************
//Set the dimensions of the canvas / graph
var margin = {top: 100, right: 80, bottom: 100, left: 200},
    width = 960 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scaleTime().range([0, width]);  
var y = d3.scaleLinear().range([height, 0]);

// Set the legend keys
var legend_keys = new Array("2010","2011","2012")
var legend_colours = new Array("CornflowerBlue","DarkCyan","DarkSlateBlue")

// Define the line
var salesline = d3.line()	
    .x(function(d) { return x(d.month); })
    .y(function(d) { return y(d.sales); });

// Adds the svg canvas
var svg = d3.selectAll("#linear")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%m");

// Get the data
d3.json("/api/monthly").then(function(data) {

  data.forEach(function(d) {
		d.month = parseTime(d.month);
		d.sales = +d.sales;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { console.log(d.month); return d.month; }));
    y.domain([0, d3.max(data, function(d) { return d.sales; })]);

    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) {return d.year;})
        .entries(data);

    legendSpace = width/dataNest.length;

    // Loop through each symbol / key
    dataNest.forEach(function(d, i) { 
       
          svg.append("path")
              .attr("class", "line")
              .attr("d", salesline(d.values))
              .style("stroke", legend_colours[i]);

          svg.append("circle").attr("cx",200+ 60*i).attr("cy",10).attr("r", 6).style("fill", legend_colours[i])
          svg.append("text").attr("x", 210 + 60*i).attr("y", 16).text(d.key).style("font-size", "15px").attr("alignment-baseline","middle")
    });
    
    // Add the X Axis
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y));

    // Create axes labels
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .style("fill", "black")
      .style("font", "17px sans-serif")
      .style("font-weight", "bold")
      .text("Sales ($)");

      svg.append("text")
      .attr("transform", `translate(${width /2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .style("font", "17px sans-serif")
      .style("font-weight", "bold")
      .text("Month");
});

// ******************************** WEEKLY SALES ********************************
var url1 = "/api/walmart"

d3.json(url1).then(wmartData => {

  wmartData = wmartData.sort((a, b) => a.Store - b.Store) 
  var dropRef = []
  // Sort Store #
  var storesID = d3.map(wmartData, function(d){return d.Store;}).keys()
  // Add All Stores
  dropRef.push("All Stores")

  storesID.forEach(function(d) {
    dropRef.push(d)
  })

  dropRef.map(store => d3.select("#selDataset1").append("option").attr("value", store).html(store));

  getChart(wmartData);
})

d3.selectAll("#selDataset1").on('change', updateChart);

function updateChart() {
  d3.json(url1).then(data => {
    data.forEach(function(d) {
      d.Store = +d.Store
    })
    var dropDown = d3.select("#selDataset1").node().value;
    d3.select(".chart").html("");
    var updateData;
    if (dropDown === "All Stores") {
      getChart(data)
    }
    else {
      updateData = data.filter(row => row.Store == +dropDown)
      getChart(updateData)
    }   
    d3.select(".counter").text(dropDown)
  })
}


function getChart(walData) {
  walData.forEach(function(sample) {
    sample.Fuel_Price = +sample.Fuel_Price;
    sample.Temperature_C = +sample.Temperature_C;
    sample.Unemployment = +sample.Unemployment;
    sample.Weekly_Sales = +Math.round(sample.Weekly_Sales);
    sample.CPI = +sample.CPI;
    sample.Store = +sample.Store
    sample.Week_Date = formatDate(sample.Week_Date);
  }); 
  function formatDate(date) {
    var d = date.split(' '),
        month = d[1],
        day = d[2],
        year = d[3];
    return [ day, month, year].join('-');
    }
  
    var svgWidth = 960;
    var svgHeight = 500;

    var margin = {
    top: 20,
    right: 40,
    bottom: 120,
    left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
        .select(".chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg.append("circle").attr("cx",width).attr("cy",30).attr("r", 6).style("fill", "orange")
    svg.append("circle").attr("cx",width).attr("cy",60).attr("r", 6).style("fill", "blue")
    svg.append("text").attr("x", (width +10)).attr("y", 35).text("Non Holiday").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", (width + 10)).attr("y", 65).text("Holiday").style("font-size", "15px").attr("alignment-baseline","middle")
        

    // Initial Params
    var chosenXAxis = "Fuel_Price";

    // function used for updating x-scale var upon click on axis label


    // function used for updating xAxis var upon click on axis label
    function renderAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));

        return circlesGroup;
    }
    function updateToolTip(chosenXAxis, circlesGroup) {

        var label;

        if (chosenXAxis === "Fuel_Price") {
            label = "Fuel Price:";
        }
        else if (chosenXAxis === "CPI") {
            label = "CPI:";
        }
        else if (chosenXAxis === "Temperature_C") {
            label = "Temperature C:"
        }
        else {
            label = "Unemployment:"
        }

        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([100, -80])
            .html(function(d) {
            return (`Date: ${d.Week_Date}<br>${label} ${d[chosenXAxis]}<br>Weekly Sale: $${(d.Weekly_Sales)}<br>${d.Holiday_Name}<br> Store: ${d.Store}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
        // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });

        return circlesGroup;
    }
    function xScale(walData, chosenXAxis) {
      // create scales
        var xLinearScale = d3.scaleLinear()
          .domain([d3.min(walData, d => d[chosenXAxis]),
            d3.max(walData, d => d[chosenXAxis])
          ])
          .range([0, width]);
    
        return xLinearScale;
    
      }

    var xLinearScale = xScale(walData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(walData, d => d.Weekly_Sales)])
      .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
      .call(leftAxis);

    // append initial circles

    var circlesGroup = chartGroup.selectAll("circle")
      .data(walData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.Weekly_Sales))
      .attr("value", d => d.Store)
      .attr("id", d => "Store" + d.Store)
      .attr("opacity", 0)
      .attr("r", function(d) {
        var dropDown = d3.select("#selDataset1").node().value;
        if (d.Store == dropDown) {
          return 10
        }
        else {
          return 5
        }
      })
      .attr("stroke", "black")
      .attr("fill", function(d) {
        if (d.Holiday_Name !== "No Holiday")
          return "blue";
        else {
          return "orange";
        }
      }) 
      .on('click', function(d) {
        var value = d3.select(this).attr("value");
        var storeCircles = d3.selectAll(`#Store${value}`)
        circlesGroup
          .transition()
          .duration(1000)
          .attr("opacity", 0.1)
          .attr("r", 3)
        storeCircles
          .transition()
          .duration(1000)
          .attr("opacity", 1.0)
          .attr("r", 10)
        d3.select(".counter").text(value)
      })
    
    circlesGroup
      .transition()
      .duration(1000)
      .attr("opacity", 1)

    d3.selectAll("button").on("click", function() {
      if (d3.select("#selDataset1").node().value === "All Stores") {
          circlesGroup
            .transition()
            .duration(1000)
            .attr("opacity", 1)
            .attr("r", 5)
          d3.select(".counter").text("All Stores")
      }
        })
    
    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var FuelLabel = labelsGroup.append("text")
      .attr("x", -200)
      .attr("y", 30)
      .attr("value", "Fuel_Price") // value to grab for event listener
      .classed("active", true)
      .text("Fuel Price");

    var CPILabel = labelsGroup.append("text")
      .attr("x", 125)
      .attr("y", 30)
      .attr("value", "CPI") // value to grab for event listener
      .classed("inactive", true)
      .text("CPI");
    var UnemLabel = labelsGroup.append("text")
      .attr("x", 35)
      .attr("y", 30)
      .attr("value", "Unemployment") // value to grab for event listener
      .classed("inactive", true)
      .text("Unemployment (%)"); 
    var TempLabel = labelsGroup.append("text")
      .attr("x", -100)
      .attr("y", 30)
      .attr("value", "Temperature_C") // value to grab for event listener
      .classed("inactive", true)
      .text("Temperature (C)"); 
    // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Weekly Sales (USD)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(walData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "CPI") {
            CPILabel
              .classed("active", true)
              .classed("inactive", false);
            FuelLabel
              .classed("active", false)
              .classed("inactive", true);
            UnemLabel
              .classed("active", false)
              .classed("inactive", true);
            TempLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "Temperature_C") {
            CPILabel
              .classed("active", false)
              .classed("inactive", true);
            FuelLabel
              .classed("active", false)
              .classed("inactive", true);
            UnemLabel
              .classed("active", false)
              .classed("inactive", true);
            TempLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else if (chosenXAxis === "Unemployment") {
            CPILabel
              .classed("active", false)
              .classed("inactive", true);
            FuelLabel
              .classed("active", false)
              .classed("inactive", true);
            UnemLabel
              .classed("active", true)
              .classed("inactive", false);
            TempLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            CPILabel
              .classed("active", false)
              .classed("inactive", true);
            FuelLabel
              .classed("active", true)
              .classed("inactive", false);
            UnemLabel
              .classed("active", false)
              .classed("inactive", true);
            TempLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });
} 

// *********************************** STOCK ***********************************
//init function for load and reset
function init(){
  d3.json("/api/stock").then(function(data){
  
    // Assign the data from `data.js` to a descriptive variable
    let tableData = data;
    
    //defining variables to plot the stock
    var dates= data.map(record=>record.dates);
    var closingPrices = data.map(record=>record.closingPrices);
    var highPrices = data.map(record=>record.highPrices);
    var lowPrices = data.map(record=>record.lowPrices);
    var openingPrices = data.map(record=>record.openingPrices);
    var volume= data.map(record=> parseInt(record.volume))
    var movingAvg= data.map(record=>record.movingAvg);
    var colors = data.map(record=>record.colors)

    //create traces and data and layout to plot the stock candlestick
    var trace1 = {
      name: 'Walmart high, low, open, close stock prices', 
      type: 'candlestick', 
      x: dates, 
      yaxis: 'y2', 
      low: lowPrices, 
      high:highPrices, 
      open: openingPrices, 
      close: closingPrices
    };

    var trace2 = {
      line: {width: 1}, 
      mode: 'lines', 
      name: 'Moving Average', 
      type: 'scatter', 
      x: dates, 
      y: movingAvg, 
      yaxis: 'y2', 
      marker: {color: '#0000FF'}
    };

    var trace3 = {
      name: 'Volume', 
      type: 'bar', 
      x: dates, 
      y: volume, 
      yaxis: 'y', 
      marker: {
        color: colors
      }
    };

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


    var data = [trace1, trace2, trace3];
  
    var layout = {
      title: "Walmart Stock",
      xaxis: {
          rangeselector: selectorOptions,
          rangeslider: {},
      },
      yaxis: {
        domain: [0, 0.2], 
        showticklabels: false
      },  
      yaxis2: {domain: [0.2, 1]}
    
    };
    
    //plot the initial plot with all data
    Plotly.newPlot('plot', data,layout);

  });
}


// Create reset button
var reset = d3.selectAll("#reset-btn")

//with click the reset button run init function to load all data
reset.on("click", init())

// Select the form and button
var data_button = d3.selectAll("#filter-btn");

// Create event handlers
data_button.on("click", runEnter());

// Complete the event handler function for the button
function runEnter() {
    
    //select the plot area
    var plotArea = d3.selectAll("#plot")

    //clear the plot area
    plotArea.html("")

    //get the input value of dates for search
    var inputValue1 = d3.select("#datetime1").property("value");
    var inputValue2 = d3.select("#datetime2").property("value");

    //clear the search field
    d3.selectAll("#datetime1").property('value', "");
    d3.selectAll("#datetime2").property('value', "");

   d3.json("/api/stock").then(function(tableData) {

    //filter the data based on the input dates
    var filteredData = tableData.filter(record => record.dates >= inputValue1);
    var finalfilteredData= filteredData.filter(item=>item.dates<=inputValue2);

    //defining variables to plot the filtered stock
    var dates1= finalfilteredData.map(row=>row.dates);
    var closingPrices1 = finalfilteredData.map(row=>row.closingPrices);
    var highPrices1 = finalfilteredData.map(row=>row.highPrices);
    var lowPrices1 = finalfilteredData.map(row=>row.lowPrices);
    var openingPrices1 = finalfilteredData.map(row=>row.openingPrices);
    var volume1= finalfilteredData.map(row=> parseInt(row.volume))
    var movingAvg1= finalfilteredData.map(row=>row.movingAvg);
    var colors1 = finalfilteredData.map(row=>row.colors)
    
    //create traces and data and layout to plot the filtered stock candlestick
    var trace4 = {
        name: `Walmart stock data from ${inputValue1} to ${inputValue2}`, 
        type: 'candlestick', 
        x: dates1, 
        yaxis: 'y2', 
        low: lowPrices1, 
        high:highPrices1, 
        open: openingPrices1, 
        close: closingPrices1
      };
    var trace5 = {
        line: {width: 1}, 
        mode: 'lines', 
        name: 'Moving Average', 
        type: 'scatter', 
        x: dates1, 
        y: movingAvg1, 
        yaxis: 'y2', 
        marker: {color: '#0000FF'}
      };

    var trace6 = {
        name: 'Volume', 
        type: 'bar', 
        x: dates1, 
        y: volume1, 
        yaxis: 'y', 
        marker: {
          color: colors1
        }
      };
    
    var data1 = [trace4, trace5, trace6];

    var layout1 = {
        title: "Walmart Stock",
        xaxis: {
            rangeslider: {},
        },
        yaxis: {
          domain: [0, 1], 
          showticklabels: false
        },  
        yaxis2: {domain: [0.2, 1]}
     
      };
      //plot the candlestick with the filtered data
      Plotly.newPlot('plot', data1, layout1);
  });
};

// ******************************** MARKET SHARE ********************************
// Market Share Service Route
var url = "/api/market_share"

// Initalize Graph and Tables
d3.json(url).then(data =>{
    // Retrieve State Name List
    var state_name = data.map(d => d.State);
    // Add All Option in Menu
    state_name.push("*All")
    // Sort and Get Unique State Name for Dropdown Menu
    var unique_state = [...new Set(state_name.sort())]; 
    // Dropdown Menu
    var DropDownMenu = d3.select("#selDataset");
    // Remove old html id names
    DropDownMenu.html("");    
    // Append id names option to html
    unique_state.map(id_name => DropDownMenu.append("option").attr("value",id_name).html(id_name));
    // Initalize Data 
    inital(data);
})
    
function inital(data){
    
    // Set Colorscale
    var scl = [[0,'rgb(5, 10, 172)'],[0.35,'rgb(40, 60, 190)'],[0.5,'rgb(70, 100, 245)'], [0.6,'rgb(90, 120, 245)'],[0.7,'rgb(106, 137, 247)'],[1,'rgb(220, 220, 220)']];
    
        var data1 = [{
            type:'scattergeo',
            locationmode: 'USA-states',
            lon: data.map(d => d.Lon),
            lat: data.map(d => d.Lat),
            hoverinfor:  `City Name: ${data.map(d => d.City)} <br> Population: ${data.map(d=>d.Population)}`,
            text:  data.map(d => d.City),
            mode: 'markers',
            marker: {
                size: 8,
                opacity: 0.8,
                reversescale: true,
                autocolorscale: false,
                symbol: 'circle',
                line: {
                    width: 1,
                    color: 'rgb(102,102,102)'
                },
                colorscale: scl,
                cmin: d3.min(data,d=>d.Share),
                cmax: d3.max(data,d=>d.Share),
                color: data.map(d => d.Share),
                colorbar: {
                    title: 'Market Share (%) <br>(All)'
                }
            }
        }];
    
    
        var layout1 = {
            title: 'Walmart Marketshare Over US (%)',
            colorbar: true,
            geo: {
                scope: 'usa',
                projection: {
                    type: 'albers usa'
                },
                showland: true,
                landcolor: 'rgb(250,250,250)',
                subunitcolor: 'rgb(217,217,217)',
                countrycolor: 'rgb(217,217,217)',
                countrywidth: 0.5,
                subunitwidth: 0.5
            }
        };
    
    Plotly.newPlot("market-share", data1, layout1);
    
    // Create table
    var tbody = d3.select("tbody");
    // Remove old tbody
    tbody.html("");
    //
    tbody.attr()
    
    // Add data to tbody
    data.forEach((entry)=>{
        // Apend row
        var row = tbody.append("tr");
        // Append value to row
        var cell = row.append("td");
        cell.text(entry.City)
        var cell2 = row.append("td");
        cell2.text(entry.State)
        var cell3 = row.append("td");
        cell3.text(entry.Population)
        var cell4 = row.append("td");
        cell4.text(entry.Share)        
    })
};
    
// Update Plot
d3.selectAll("#selDataset").on('change', updatePlotly);
    
// Update Plot Function
function updatePlotly(){
    
    d3.json(url).then(data => {
            // Get Value From Search Bar
            var dropdownMenu = d3.select("#selDataset").node().value;
            // Clear graphs
            d3.select("#market-share").html("");
    
    
            if (dropdownMenu == "*All"){
                inital(data);
            }
            else {
                var filter_data = data.filter(row => row.State == dropdownMenu);
                var scl = [[0,'rgb(5, 10, 172)'],[0.35,'rgb(40, 60, 190)'],[0.5,'rgb(70, 100, 245)'], [0.6,'rgb(90, 120, 245)'],[0.7,'rgb(106, 137, 247)'],[1,'rgb(220, 220, 220)']];
    
                var data2 = [{
                type:'scattergeo',
                locationmode: 'USA-states',
                lon: filter_data.map(d => d.Lon),
                lat: filter_data.map(d => d.Lat),
                hoverinfor:  filter_data.map(d => d.City),
                text:  filter_data.map(d => d.City),
                mode: 'markers',
                marker: {
                    size: 8,
                    opacity: 0.8,
                    reversescale: true,
                    autocolorscale: false,
                    symbol: 'circle',
                    line: {
                        width: 1,
                        color: 'rgb(102,102,102)'
                    },
                    colorscale: scl,
                    cmin: d3.min(data,d=>d.Share),
                    cmax: d3.max(data,d=>d.Share),
                    color: filter_data.map(d => d.Share),
                    colorbar: {
                        title: `Market Share (%)<br>(${dropdownMenu})`
                    }
                    }
                }];
        
        
                var layout2 = {
                    title: `Walmart Marketshare Over US (%) <br>(${dropdownMenu})`,
                    colorbar: true,
                    geo: {
                    scope: 'usa',
                    projection: {
                        type: 'albers usa'
                    },
                    showland: true,
                    landcolor: 'rgb(250,250,250)',
                    subunitcolor: 'rgb(217,217,217)',
                    countrycolor: 'rgb(217,217,217)',
                    countrywidth: 0.5,
                    subunitwidth: 0.5}
                };

                Plotly.newPlot("market-share", data2, layout2);
                // Create table
                var tbody = d3.select("tbody");
                // Clear tbody
                tbody.html("");

                filter_data.forEach((entry)=>{
                    //Add row
                    var row = tbody.append("tr");
                    //Add value to row
                    var cell = row.append("td");
                    cell.text(entry.City)
                    var cell2 = row.append("td");
                    cell2.text(entry.State)
                    var cell3 = row.append("td");
                    cell3.text(entry.Population)
                    var cell4 = row.append("td");
                    cell4.text(entry.Share)        
                });                
            }
    })
};
    
// ******************************** STORE LOCATION ********************************
//Establish data source
const store_url = '/api/store';

d3.json(store_url).then(function(data) { 
    createMap(data);

});

function createMap(data) {

    var myIcon = L.icon({
        iconUrl: 'https://s3.amazonaws.com/shecodesio-production/uploads/files/000/004/934/original/shopping_cart.png?1613066289',
        iconSize: [30,25]
    })

    var marker = [];
    data.forEach(function(dataPoint) {
        marker.push(
            L.marker([dataPoint.Latitude, dataPoint.Longitude], {
                icon:myIcon})
                .bindPopup("<h4>" + dataPoint.City + "</h4><hr /><h6>" + dataPoint.Address + "</h6>")
        )   
    })

    var markerLayer = L.layerGroup(marker);

    var clusters = L.markerClusterGroup();
    clusters.addLayer(markerLayer);

    var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });
    
    var watercolor = L.tileLayer.provider('Stamen.Watercolor');

    var baseMaps = {
        "Dark Map": darkmap,
        "Street Map": streetmap,
        "Light Map": lightmap,
        "Watercolor": watercolor
    };

    var overlayMaps = {
        Stores: markerLayer
    };

    var myMap = L.map("map", {
        center: [43.198510, -112.359900],
        zoom: 4,
        layers: [lightmap],
        fullscreenControl: true,
        zoomControl: false
    });
    
    myMap.addLayer(clusters);

    L.control
        .layers(baseMaps, overlayMaps, {
        collapsed: true})
        .addTo(myMap);

    L.control.zoomslider().addTo(myMap);
}
