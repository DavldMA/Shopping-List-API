const express = require("express");
const db = require("./connect")
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/*
 Users : username / email / password 
 Lists : name / array(items) items -> (name/quantities) /   
 
 to save locally (lists if not logged in and maybe products inserted previosly)

 API

 login
 user update   
 register   
 (delete account???????)
 
 import list
 export
 share(by id and import based on that)
 
 APP

 portuguese and english languages in strings
 pages for everything



 username
 token

*/
app.get("/", function(req,res,next){
    res.json({"as":"as"})
})

app.get("/login", function(req,res,next){
    db.connectToMongoDB()
})


app.post("/login", function(req,res,next){
    db.connectToMongoDB()
})

app.listen(8801, () => {console.log("started")})
