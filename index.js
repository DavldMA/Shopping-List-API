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

app.get("/user/login/:value", async function(req,res,next){
    var xd = await db.main()
    res.json(xd)
})

app.post("/user/login", async function(req,res,next){
    
    console.log(req.body);
    //db.connectToMongoDB()
})

app.get("/user/register/:value", async function(req,res,next){
    var xd = await db.main()
    res.json(xd)
})

app.post("/user/register", async function(req,res,next){
    const message = await db.addUser(req.body);
    res.json(message)
})

app.listen(8801, () => {console.log("started")})