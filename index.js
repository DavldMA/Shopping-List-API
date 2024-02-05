const express = require("express");
const db = require("./connect")
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/list/update", async function(req,res,next){
    const message = await db.addList(req.body);
    res.json({"as":"as"})
})

app.post("/list/add", async function(req,res,next){
    const message = await db.addList(req.body);
    res.json(message)
})

app.delete("/list/removelist", async function(req, res, next) {
    const message = await db.removeUserFromList(req.body)
    res.json(message)
})

app.get("/list/all", async function(req,res,next){
    const lists = await db.getAllListsByUsername(req.query.username);
    res.json({lists});
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