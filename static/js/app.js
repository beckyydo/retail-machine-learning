var home_login = d3.selectAll("#home-login")

home_login.on("click", function(){
    var grocery = d3.selectAll("#grocery-recommendations")
    grocery.html("");
})