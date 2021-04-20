'use strict';

/* ===== Enable Bootstrap Popover (on element  ====== */

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

/* ==== Enable Bootstrap Alert ====== */
var alertList = document.querySelectorAll('.alert')
alertList.forEach(function (alert) {
  new bootstrap.Alert(alert)
});


/* ===== Responsive Sidepanel ====== */
const sidePanelToggler = document.getElementById('sidepanel-toggler'); 
const sidePanel = document.getElementById('app-sidepanel');  
const sidePanelDrop = document.getElementById('sidepanel-drop'); 
const sidePanelClose = document.getElementById('sidepanel-close'); 

window.addEventListener('load', function(){
	responsiveSidePanel(); 
});

window.addEventListener('resize', function(){
	responsiveSidePanel(); 
});


function responsiveSidePanel() {
    let w = window.innerWidth;
	if(w >= 1200) {
	    // if larger 
	    //console.log('larger');
		sidePanel.classList.remove('sidepanel-hidden');
		sidePanel.classList.add('sidepanel-visible');
		
	} else {
	    // if smaller
	    //console.log('smaller');
	    sidePanel.classList.remove('sidepanel-visible');
		sidePanel.classList.add('sidepanel-hidden');
	}
};

sidePanelToggler.addEventListener('click', () => {
	if (sidePanel.classList.contains('sidepanel-visible')) {
		console.log('visible');
		sidePanel.classList.remove('sidepanel-visible');
		sidePanel.classList.add('sidepanel-hidden');
		
	} else {
		console.log('hidden');
		sidePanel.classList.remove('sidepanel-hidden');
		sidePanel.classList.add('sidepanel-visible');
	}
});



sidePanelClose.addEventListener('click', (e) => {
	e.preventDefault();
	sidePanelToggler.click();
});

sidePanelDrop.addEventListener('click', (e) => {
	sidePanelToggler.click();
});



/* ====== Mobile search ======= */
const searchMobileTrigger = document.querySelector('.search-mobile-trigger');
const searchBox = document.querySelector('.app-search-box');

searchMobileTrigger.addEventListener('click', () => {

	searchBox.classList.toggle('is-visible');
	
	let searchMobileTriggerIcon = document.querySelector('.search-mobile-trigger-icon');
	
	if(searchMobileTriggerIcon.classList.contains('fa-search')) {
		searchMobileTriggerIcon.classList.remove('fa-search');
		searchMobileTriggerIcon.classList.add('fa-times');
	} else {
		searchMobileTriggerIcon.classList.remove('fa-times');
		searchMobileTriggerIcon.classList.add('fa-search');
	}
	
		
	
});

/*****************************************OVERVIEW*****************************************/
function diff_arrow(num, d3_element){
    var dollar = d3.format("$,.2f")(num)
    if (num > 0) {
        d3_element.html('<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up" fill="green" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/></svg><span style="color:green;">'
        + dollar +"</span>")
    } else{
        d3_element.html('<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-down" fill="red" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/></svg><span style="color:red;">'
        + dollar+"</span>");
    }
};

/*METRIC*/
d3.json("/overview/metric").then( weekdata =>{

    var sale = weekdata.Sales;
    var week = weekdata.Week;
    var margin = weekdata.Margin;
    var ytd = weekdata.YeartoDate;

    /*Sales*/
    var dollar_format = d3.format("$,.2f");
    var sale_format = dollar_format(sale);
    var metric_sales = d3.selectAll("#overview_sales");
    metric_sales.text(sale_format);
    
    /*Difference in sales last week*/
    var diff_sales = d3.selectAll("#diff_sales");
    var sales_diff = weekdata.Diff_Sales;
    diff_arrow(sales_diff,diff_sales);

    /*Margin*/
    var metric_margin = d3.selectAll("#overview_margin");
    metric_margin.text(margin + "%");
    /*Difference in sales last week*/
    var diff_margin = d3.selectAll("#diff_margin");
    var margin_diff = weekdata.Diff_Margin;
    diff_arrow(margin_diff,diff_margin);

    var formatDate = d3.timeFormat("%B %d,%Y");
    var date_format = formatDate(new Date(week));
    var metric_week = d3.selectAll("#overview_week");
    metric_week.text(date_format);

    /*Year to Date*/
    var metric_ytd = d3.selectAll("#overview_ytd");
    var ytd_sale = dollar_format(ytd);
    metric_ytd.text(ytd_sale);
    var diff_ytd = d3.selectAll("#diff_ytd");
    var ytd_diff = weekdata.Diff_YTD;
    diff_arrow(ytd_diff,diff_ytd);
 
});

 /*Weekly Sales Chart*/
function inital_sales(){
    d3.json("/api/weeklysales").then( sales_data =>{
        /*Dollar & Date Format*/
        var dollar_format = d3.format("$,.2f");
        var formatDate = d3.timeFormat("%b %d,%Y")
        var sale = sales_data.map(d => dollar_format(d.Sale));
        var week = sales_data.map(d => formatDate(new Date(d.Week)));

        d3.json("/api/ytd_weeklysales").then( ytd_data =>{
            var ytd_sale = ytd_data.map(d => dollar_format(d.YTD_Sale));
            var trace1 = {
                x: week,
                y: sale,
                name: "Current Year",
                type: 'line',
                line: {
                    shape: 'spline',
                    color: '#f0ad4e',
                    smoothing: 1.3
                }
            };
            var trace2 = {
                x: week,
                y: ytd_sale,
                name: 'Last Year',
                type: 'line',
                line: {
                    shape: 'spline',
                    dash: 'dashdot',
                    color: 'grey',
                    smoothing: 1.3
                }
            };
            var data = [trace1, trace2]
            var layout = {
                margin: {
                    l:70,
                    r:30,
                    b:60,
                    t:20
                },
                xaxis:{
                    title: 'Date (Week)'
                },
                yaxis:{
                    title: 'Sales $'
                },
                legend: {
                    yanchor:'top',
                    xanchor:'right',
                    y: -0.09
                }
            }; 
            var config = {responive: true}
            Plotly.newPlot('weekly_sales',data,layout, config);
        });
    });
};

inital_sales();

d3.selectAll("#sale_dropdown").on("change", ytd)

function ytd(){
    d3.json("/api/ytdsales").then( sales_data =>{
        d3.select("#weekly_sales").html("");
        var selection = d3.select("#sale_dropdown").node().value;
        
        if (selection=="4 Weeks"){
            inital_sales();
        } 
        else {
        /*Dollar & Date Format*/
        var dollar_format = d3.format("$,.2f");
        var formatDate = d3.timeFormat("%b-%d")
        var sale = sales_data.map(d => dollar_format(d.Sale));
        var week = sales_data.map(d => formatDate(new Date(d.Week)));

        d3.json("/api/ly_ytdsales").then( ytd_data =>{
            console.log(ytd_data)
            var ytd_sale = ytd_data.map(d => dollar_format(d.YTD_Sale));
            var trace1 = {
                x: week,
                y: sale,
                name: "Current Year",
                type: 'line',
                line: {
                    shape: 'spline',
                    color: '#f0ad4e',
                    smoothing: 1.3
                }
            };
            var trace2 = {
                x: week,
                y: ytd_sale,
                name: 'Last Year',
                type: 'line',
                line: {
                    shape: 'spline',
                    dash: 'dashdot',
                    color: 'grey',
                    smoothing: 1.3
                }
            };
            var data = [trace1, trace2]
            var layout = {
                margin: {
                    l:70,
                    r:30,
                    b:60,
                    t:20
                },
                xaxis:{
                    title: 'Date (Week)'
                },
                yaxis:{
                    title: 'Sales $'
                },
                legend: {
                    yanchor:'top',
                    xanchor:'right',
                    y: -0.2
                }
            }; 
            var config = {responive: true};
            Plotly.newPlot('weekly_sales',data,layout, config);
        });
        }
    });
};