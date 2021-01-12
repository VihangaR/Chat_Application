var express = require("express");
var socket = require("socket.io");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var Message = require("./models/message");
var User = require("./models/user");
var app = express();
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

app.use(bodyParser.urlencoded({extended: true}));
// Use ejs as the extension
app.set("view engine", "ejs");
// Use the static files in the public directory
app.use(express.static(__dirname + "/public"));
// Use the method override function (Update route)
app.use(methodOverride("_method"));

// Set port to 5000
app.set("port", (process.env.PORT || 5000));
// Routing on port 5000
var server = app.listen(app.get("port"), function() {
  console.log("Chat application has started on port", app.get("port"));
});
// Socket setup
var io = socket(server);

var session = require("express-session")({
    secret: "agowfugaowzxdhrzxdrbzsrzr",
    resave: false,
    saveUninitialized: false
});
// Authentication
app.use(session);
// Need anytime you use passport (required)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// Encoding and decoding the session (required)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Database Handling
mongoose.connect("mongodb+srv://vihanga:qwe123@cluster0.qr5wr.mongodb.net/chat_app?retryWrites=true&w=majority");

// =========================
// LOGIN ROUTES
// =========================
// Login logic (post route)
app.post("/login", passport.authenticate("local", {
        successRedirect: "/chat",
        failureRedirect: "/login"
    }), function(req, res){
});
// Logout logic
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});
// =========================
// ISLOGGEDIN MIDDLEWARE
// =========================
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

/////////////////////////////////////////////////////////
//////////////////////// Routes /////////////////////////
/////////////////////////////////////////////////////////
app.get("/", function(req, res){
    res.redirect("/login");
});

app.get("/login", function(req, res){
    if (req.user) {
        res.redirect("/chat")
    } else {
        res.render("login");
    }
})

app.get("/register", function(req, res){
    res.render("register", {userTaken: false});
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username, handle: req.body.handle}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {userTaken: true});
        } else {
            passport.authenticate("local")(req,res, function(){
                res.redirect("/chat");
            });
        }
    });
});

app.get("/chat", isLoggedIn, function(req, res){
    Message.find({}, function(err, messages){
        res.render("chat", {handle: req.user.handle, messages: messages});
    });
});
var userList = {}
io.on("connection", function(socket){
    socket.on("disconnect", function(){
        console.log("Socket has disconnected");
        console.log(userList);
        console.log(socket.id);
        delete userList[socket.id];
        updateList(userList);
    });
    socket.on("handle", function(handle){
        var sHandle = handle;
        userList[socket.id] = sHandle;
        console.log(userList);
        console.log("We have a connection with " + userList[socket.id]);
        updateList(userList);
    })
    function updateList(userList){
        ul = []
        for(var key in userList){
            tempUser = userList[key]
            if(ul.includes(tempUser) == false){
                ul.push(userList[key]);
            }
            console.log(ul);
        }
        io.emit("user list", ul);
    }
    socket.on("chat message", function(msg){
        Message.create(msg, function(err, newMessage){
            console.log(newMessage);
        });
        io.emit("chat message", msg);
    });
});