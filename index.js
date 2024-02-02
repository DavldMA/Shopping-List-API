const express = require("express");
const db = require("./connect")
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", function(req,res,next){
    res.json({"as":"as"})
})

app.get("/product/:value", async function(req,res,next){
    res.json({"as":"as"})
})

app.post("/product/add", async function(req,res,next){
    res.json({"as":"as"})
})

app.get("/product/all", async function(req,res,next){
    const message = await db.getAllListsByUsername(req.body.username);
    res.json(message);
})

/*app.get("/list/:value", async function(req,res,next){
    res.json({"as":"as"})
})*/

app.post("/list/add", async function(req,res,next){
    res.json({"as":"as"})
})

app.get("/list/all", async function(req,res,next){
    const message = await db.getAllListsByUsername(req.body.username);
    console.log(message)
    res.json(message);
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