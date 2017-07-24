const express = require("express");
const passport = require('passport');
const User = require("../model/userModel");
const router = express.Router();
    
router.get("/",function(req, res, next){
    res.render("index",{token: req.csrfToken()});        
}); 

router.post("/signin", function(req,res,next){
    if(req.body.login === "" && req.body.password === "")
        return res.json({message:"empty fiels"});
    
    passport.authenticate("signin", function(err, user, info) {
        if (err) return next(err);
        if (!user) return res.status(401).json(info);
        
        req.logIn(user, function(err) {
            if (err) return next(err); 
            req.session.user = user
            return res.redirect('/');
        });
  })(req, res, next);
});

router.get("/signout",function(req,res, next){
    req.logOut();
    req.session.user = null;
    res.redirect("/");
});

router.route("/signup")
    .get(function(req,res){
        res.render("regpage", { token: req.csrfToken()});
    })
    .post(function(req, res, next) {
        let newUser = new User();
        newUser.email = req.body.email;
        newUser.nickname = req.body.nickname;
        newUser.login = req.body.login;
        newUser.password = req.body.password;

        newUser.save(function (err,result){
            if(err) next(err);
            res.redirect("/");
    });  
});

//----- validation email and nickname
router.post('/validate', function(req, res, next) {
    if(req.body.valid === "nickname"){
        User.findOne({'nickname': req.body.nickname} , function(err, user){    
            if(err) return res.status(500).next(err);            
            if(user) return res.send("Это имя уже занято");
            res.send("true");
        })
    }
    else if(req.body.valid === "email"){
        User.findOne({'email': req.body.email} , function(err, user){    
            if(err) return res.status(500).next(err);            
            if(user) return res.send("Этот email уже используется");
            res.send("true");
        })        
    }
    else res.sendStatus(404);
});

module.exports = router;