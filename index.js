const express = require("express");
const path = require('path');
const db = require("./connect")
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());



app.post("/list/update", async function(req,res,next){
    const message = await db.addList(req.body);
    res.json({"as":"as"})
})

app.post("/list/share", async function(req, res, next) {
    const message = await db.generateNewShortURL(req.body)
    res.json(message)
})

app.get("/list/share/id/:id", async function(req, res, next) {
    console.log(req.params.id)
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
})

app.post("/list/add", async function(req,res,next){
    const message = await db.addList(req.body);
    res.json(message)
})

app.delete("/list/removelist/:username/:listname", async function(req, res, next) {
    const message = await db.removeUserFromList(req.params.username, req.params.listname)
    res.json(message)
})

app.post("/list/updatelist/", async function(req, res, next) {
    console.log(req.body)
})

app.get("/list/all", async function(req,res,next){
    const lists = await db.getAllListsByUsername(req.query.username);
    res.json({lists});
})

app.post("/user/login", async function(req,res,next){
    const message = await db.login(req.body);
    console.log("test")
    res.json(message);
})

app.post("/list/enter", async function(req,res,next){
    const message = await db.findRedirectURL(req.body);
    res.json(message);
})

app.post("/user/register", async function(req,res,next){
    const message = await db.addUser(req.body);
    res.json(message);
})

app.listen(8801, () => {console.log("started")})