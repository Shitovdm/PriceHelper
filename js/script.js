$(document).ready(function(){
    var tmPrice = $(".ip-bestprice").text();
    $("#tmPrice").add(tmPrice);
    $(".main").css("color","red");
    console.log("Price: ");
    console.log("Price: ", tmPrice);
});
