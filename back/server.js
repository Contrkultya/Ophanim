const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const db = require("./models");
const bcrypt = require("bcryptjs");
const Role = db.role;
const User = db.user;
const Building = db.building;

var corsOptions = {
    origin: "http://localhost:3000"
};
function initial() {
}


app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//db.sequelize.sync({force: true}).then(() => {
  //  console.log('Drop and Resync Db');
  //  initial();
//});
// for production:
db.sequelize.sync();

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to suedom." });
});
require('./routes/routes.routes')(app);
// set port, listen for requests
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
