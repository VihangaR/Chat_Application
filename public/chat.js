$(function () {
    $("#messages").scrollTop(1E10);
    var socket = io();
    socket.emit("handle", $("#han").text());
    // Handle sending the message
    $("form").submit(function(){
        if($("#m").val()){
            var msg = {
                handle: $("#han").text(),
                msg: $("#m").val()
            }
            socket.emit("chat message", msg);
            $("#m").val("");
            return false;
        } else {
            return false;
        }   
    });
    // Handle receiving the message
    socket.on("chat message", function(msg){
        $("#messages").append("<div class='msgLine'><b>" + msg.handle + "</b>: " + msg.msg);
        $("#messages").scrollTop(1E10);
    });
    socket.on("user list", function(ul){
        str = "";
        ul.forEach(function(name){
            str += name + ", "
        });
        str = str.slice(0, -2);
        $("#onlineUsers").html(str);
        cul = ul;
    });
    socket.on("socket disconnected", function(discUser){
        str = "";
        cul.forEach(function(name){
            if(name != discUser){
                str += name + ", "
            }            
        });
        str = str.slice(0, -2);
        $("#onlineUsers").html(str);
    });
});