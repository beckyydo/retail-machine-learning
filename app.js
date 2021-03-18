var login = d3.select(".input_user")

var login_button = d3.select(".login_btn")

login_button.on("click", function(){
    console.log(login.property("value"))
    var user_name = login.property("value")


    
})