var home_login = d3.selectAll("#home-login")

home_login.on("click", function(){
    var grocery = d3.selectAll("#grocery-recommendations")
    grocery.html("");
})

$(document).ready(function(){
    $('button').click(function(){
        $('.alert').show()
    }); 

    $('button').click(function(){
        $(this).parents('div').hide();
    }); 
});