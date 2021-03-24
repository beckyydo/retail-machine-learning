const url = "api/stock"

// Load data

d3.json(url).then(function(data){
    console.log(data);
});

