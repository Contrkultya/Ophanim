const controller = require("../controllers/cool.controller");

module.exports = function(app) {
    app.post("/api/parse", controller.parse);
    app.post("/api/analyze", controller.analyze);
    app.get("/api/parsesByid", controller.parsingsById);
    app.get("/api/resByid", controller.resultsById);
    app.get("/api/allResults", controller.allResults);
    app.get("/status/:id", controller.getStatus);
};
