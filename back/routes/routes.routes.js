const controller = require("../controllers/cool.controller");

module.exports = function(app) {
    app.post("/api/parse", controller.parse);
    app.post("/api/analyze", controller.analyze);
    app.get("/api/id", controller.parsingsById);
    app.get("/status/:id", controller.getStatus);
};
