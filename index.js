const express = require("express");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
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


*/


app.post("/login", function(req,res,next){
    console.log();


})







app.listen(8801, () => console.log("started"))
