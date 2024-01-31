const express = require("express");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());





app.listen(8801, () => console.log("started"))
