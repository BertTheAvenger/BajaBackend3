/*PATH = /api/test */
module.exports = (app) => {
    app.get("/api/test/", (req, res) => {
       res.send("You have been tested.");
    });
};