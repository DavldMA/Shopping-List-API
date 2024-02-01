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

app.get("/user/:value", function(req,res,next){
    res.json({"as":"as"})
})

app.get("/product/:value", function(req,res,next){
    res.json({"as":"as"})
})

app.get("/list/:value", function(req,res,next){
    res.json({"as":"as"})
})

app.post("/user/login", async function(req,res,next){
    const message = await db.login(req.body);
    res.json(message);
})

app.post("/user/register", async function(req,res,next){
    const message = await db.addUser(req.body);
    res.json(message);
})

app.listen(8801, () => {console.log("started")})