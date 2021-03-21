var url = "/api/walmart"

d3.csv("walmartdata.csv").then(wmartData => {
  //if (err) throw err;
  console.log("start")
  date = d3.map(wmartData, function(d) {
  return d.Week_Date
  })
  console.log(date)
  var dropRef = []
  var storesID = d3.map(wmartData, function(d){return d.Store;}).keys()
  dropRef.push("All Stores")
  storesID.forEach(function(d) {
    dropRef.push(d)
  })
  console.log(dropRef)
  dropRef.map(store => d3.select("#selectDataset").append("option").attr("value", store).html(store));
  init(wmartData);
  var dataoptions = []
  dataoptions.push("2010-2012")
  dataoptions.push("2012 Real")
  dataoptions.push("2012 Predictions")
  dataoptions.push("2013 Predictions")
  dataoptions.map(set =>d3.select("#selPreDataset").append("option").html(set))
})



d3.selectAll("#selectDataset").on('change', function() {
  //console.log(d3.selectAll("circle"))
  d3.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("opacity", 0),
  updateChart()
});

d3.selectAll("#selPreDataset").on('change', function() {
  //console.log(d3.selectAll("circle"))
  d3.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("opacity", 0),
  updateChart()
});

function updateChart() {
  var seldataset = d3.select("#selPreDataset").node().value;
  if (seldataset  === "2010-2012") {
    d3.csv("walmartdata.csv").then(data => {
      var dropDown = d3.select("#selectDataset").node().value;
      console.log(dropDown)
      d3.select(".chart").html("");
      var updateData;
      if (dropDown === "All Stores") {
        init(data)
      }
      else {
        updateData = data.filter(row => row.Store === dropDown)
        //console.log(updateData)
        init(updateData)
      }   
      d3.select(".counter").text(dropDown)
      })
  }
  else if (seldataset  === "2012 Predictions") {
    d3.csv("final_comparison.csv").then(data => {
      var dropDown = d3.select("#selectDataset").node().value;
      console.log(dropDown)
      d3.select(".chart").html("");
      var updateData;
      if (dropDown === "All Stores") {
        init2012(data)
      }
      else {
        updateData = data.filter(row => row.Store === dropDown)
        //console.log(updateData)
        init2012(updateData)
      }   
      d3.select(".counter").text(dropDown)
      })
    }
    else if (seldataset  === "2012 Real") {
      d3.csv("final_comparison.csv").then(data => {
        var dropDown = d3.select("#selectDataset").node().value;
        console.log(dropDown)
        d3.select(".chart").html("");
        var updateData;
        if (dropDown === "All Stores") {
          initReal2012(data)
        }
        else {
          updateData = data.filter(row => row.Store === dropDown)
          //console.log(updateData)
          initReal2012(updateData)
        }   
        d3.select(".counter").text(dropDown)
        })
      }
      else if (seldataset  === "2013 Predictions") {
        d3.csv("final2013predix.csv").then(data => {
          var dropDown = d3.select("#selectDataset").node().value;
          console.log(dropDown)
          d3.select(".chart").html("");
          var updateData;
          if (dropDown === "All Stores") {
            init2013(data)
          }
          else {
            updateData = data.filter(row => row.Store === dropDown)
            //console.log(updateData)
            init2013(updateData)
          }   
          d3.select(".counter").text(dropDown)
          })
        }
  } 
let current_datetime = new Date()
console.log(current_datetime.toString())
let formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
console.log(formatted_date)

function init(walData) {
  walData.forEach(function(sample) {
    sample.Fuel_Price = +sample.Fuel_Price;
    sample.Temperature_C = +sample.Temperature_C;
    sample.Unemployment = +sample.Unemployment;
    sample.Weekly_Sales = +Math.round(sample.Weekly_Sales);
    sample.CPI = +sample.CPI;
    sample.Store = +sample.Store
  }); 

  function formatDate(date) {
    var d = date.split(' '),
        month = d[1],
        day = d[2],
        year = d[3];
    return [month, day, year].join('-');
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
            return (`Week Date: ${d.Week_Date}<br>${label} ${d[chosenXAxis]}<br>Weekly Sale: $${(d.Weekly_Sales)}<br>${d.Holiday_Name}<br> Store: ${d.Store}`);
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
        var dropDown = d3.select("#selectDataset").node().value;
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
        console.log(value)
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
      if (d3.select("#selectDataset").node().value === "All Stores") {
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
      .attr("x", 25)
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

          // console.log(chosenXAxis)

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
function initReal2012(walData) {
  walData.forEach(function(sample) {
    sample.Fuel_Price = +sample.Fuel_Price;
    sample.Temperature_C = +sample.Temperature_C;
    sample.Unemployment = +sample.Unemployment;
    sample.Weekly_Sales = +Math.round(sample.Weekly_Sales);
    sample.CPI = +sample.CPI;
    sample.Store = +sample.Store
  }); 

  function formatDate(date) {
    var d = date.split(' '),
        month = d[1],
        day = d[2],
        year = d[3];
    return [month, day, year].join('-');
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
    svg.append("circle").attr("cx",width).attr("cy",90).attr("r", 6).style("fill", "black")
    svg.append("text").attr("x", (width +10)).attr("y", 35).text("Average").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", (width + 10)).attr("y", 65).text("Above Average").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", (width + 10)).attr("y", 95).text("Below").style("font-size", "15px").attr("alignment-baseline","middle")
            

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
            return (`Week Date: ${d.Date}<br>${label} ${d[chosenXAxis]}<br>Weekly Sale: $${(d.Weekly_Sales)}<br> Store: ${d.Store}`);
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
        var dropDown = d3.select("#selectDataset").node().value;
        if (d.Store == dropDown) {
          return 10
        }
        else {
          return 5
        }
      })
      .attr("stroke", "black")
      .attr("fill", function(d) {
        if (d.Model_Label_Pred == "Average") {
          return "orange";
        }
        else if (d.Model_Label_Pred === "Above") {
          return "blue";
        }
        else {
          return "black"
        }
      }) 
      .on('click', function(d) {
        var value = d3.select(this).attr("value");
        console.log(value)
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
      if (d3.select("#selectDataset").node().value === "All Stores") {
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
      .attr("x", 25)
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

          // console.log(chosenXAxis)

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
function init2012(walData) {
  walData.forEach(function(sample) {
    sample.Pred_Fuel_Pric = +sample.Pred_Fuel_Pric;
    sample.Pred_Temp = +sample.Pred_Temp;
    sample.Pred_Unem = +sample.Pred_Unem;
    sample.Pred_Week_Sales = +Math.round(sample.Pred_Week_Sales);
    sample.Pred_CPI = +sample.Pred_CPI;
    sample.Store = +sample.Store
  }); 

  function formatDate(date) {
    var d = date.split(' '),
        month = d[1],
        day = d[2],
        year = d[3];
    return [month, day, year].join('-');
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
    svg.append("circle").attr("cx",width).attr("cy",90).attr("r", 6).style("fill", "black")
    svg.append("text").attr("x", (width +10)).attr("y", 35).text("Average").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", (width + 10)).attr("y", 65).text("Above Average").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", (width + 10)).attr("y", 95).text("Below").style("font-size", "15px").attr("alignment-baseline","middle")
            

    // Initial Params
    var chosenXAxis = "Pred_Fuel_Pric";
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

        if (chosenXAxis === "Pred_Fuel_Pric") {
            label = "Fuel Price:";
        }
        else if (chosenXAxis === "Pred_CPI") {
            label = "CPI:";
        }
        else if (chosenXAxis === "Pred_Temp") {
            label = "Temperature C:"
        }
        else {
            label = "Unemployment:"
        }

        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([100, -80])
            .html(function(d) {
            return (`Week Date: ${d.Date}<br>${label} ${d[chosenXAxis]}<br>Weekly Sale: $${(d.Pred_Week_Sales)}<br> Store: ${d.Store}`);
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
      .domain([0, d3.max(walData, d => d.Pred_Week_Sales)])
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
      .attr("cy", d => yLinearScale(d.Pred_Week_Sales))
      .attr("value", d => d.Store)
      .attr("id", d => "Store" + d.Store)
      .attr("opacity", 0)
      .attr("r", function(d) {
        var dropDown = d3.select("#selectDataset").node().value;
        if (d.Store == dropDown) {
          return 10
        }
        else {
          return 5
        }
      })
      .attr("stroke", "black")
      .attr("fill", function(d) {
        if (d.Model_Label_Pred == "Average") {
          return "orange";
        }
        else if (d.Model_Label_Pred === "Above") {
          return "blue";
        }
        else {
          return "black"
        }
      }) 
      .on('click', function(d) {
        var value = d3.select(this).attr("value");
        console.log(value)
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
      if (d3.select("#selectDataset").node().value === "All Stores") {
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
      .attr("value", "Pred_Fuel_Pric") // value to grab for event listener
      .classed("active", true)
      .text("Fuel Price");

    var CPILabel = labelsGroup.append("text")
      .attr("x", 125)
      .attr("y", 30)
      .attr("value", "Pred_CPI") // value to grab for event listener
      .classed("inactive", true)
      .text("CPI");
    var UnemLabel = labelsGroup.append("text")
      .attr("x", 25)
      .attr("y", 30)
      .attr("value", "Pred_Unem") // value to grab for event listener
      .classed("inactive", true)
      .text("Unemployment (%)"); 
    var TempLabel = labelsGroup.append("text")
      .attr("x", -100)
      .attr("y", 30)
      .attr("value", "Pred_Temp") // value to grab for event listener
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

          // console.log(chosenXAxis)

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
          if (chosenXAxis === "Pred_CPI") {
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
          else if (chosenXAxis === "Pred_Temp") {
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
          else if (chosenXAxis === "Pred_Unem") {
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

function init2013(walData) {
  walData.forEach(function(sample) {
    sample.Fuel_Price = +sample.Fuel_Price;
    sample.Temperature_C = +sample.Temperature_C;
    sample.Unemployment = +sample.Unemployment;
    sample.Weekly_Sales = +Math.round(sample.Weekly_Sales);
    sample.CPI = +sample.CPI;
    sample.Store = +sample.Store
  }); 

  function formatDate(date) {
    var d = date.split(' '),
        month = d[1],
        day = d[2],
        year = d[3];
    return [month, day, year].join('-');
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
    svg.append("circle").attr("cx",width).attr("cy",90).attr("r", 6).style("fill", "black")
    svg.append("text").attr("x", (width +10)).attr("y", 35).text("Average").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", (width + 10)).attr("y", 65).text("Above Average").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", (width + 10)).attr("y", 95).text("Below").style("font-size", "15px").attr("alignment-baseline","middle")
            

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
            return (`Week Date: ${d.Date}<br>${label} ${d[chosenXAxis]}<br>Weekly Sale: $${(d.Weekly_Sales)}<br> Store: ${d.Store}`);
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
        var dropDown = d3.select("#selectDataset").node().value;
        if (d.Store == dropDown) {
          return 10
        }
        else {
          return 5
        }
      })
      .attr("stroke", "black")
      .attr("fill", function(d) {
        if (d.Label == "Average") {
          return "orange";
        }
        else if (d.Label === "Above") {
          return "blue";
        }
        else {
          return "black"
        }
      }) 
      .on('click', function(d) {
        var value = d3.select(this).attr("value");
        console.log(value)
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
      if (d3.select("#selectDataset").node().value === "All Stores") {
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
      .attr("x", 25)
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

          // console.log(chosenXAxis)

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