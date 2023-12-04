import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import session from "express-session";
import passport  from "passport";
import PassportLocalMongoose from "passport-local-mongoose";

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://127.0.0.1:27017/Oauth",{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
    name:String,
    password:String
});

userSchema.plugin(PassportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.get("/logout",(req,res)=>{
    req.logOut();
    res.redirect("/");
})

app.post("/register",(req,res)=>{
    
    User.register({username:req.body.username},req.body.password,function(err,user){
        if (err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
})

app.post("/login",(req,res)=>{
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })
    
});

app.listen(3000,()=>{
    console.log("server started on port 3000");
});