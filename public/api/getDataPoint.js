
let db;
module.exports = (app, dbClient) => {
    db = dbClient;
    app.post("/api/getdatapoint/", async (req, res, next) => {
        console.log(req.body);
        if(!(req.body && req.body.time && req.body.run)) {res.status(400)}

        const time = Number(req.body.time);
        let data = await db.collection("runs").find({time : time}).toArray();
        let toSend = data[0];

        if(toSend) {
            delete toSend._id;
            console.log(toSend);
            res.status(200).json(toSend);
        } else {
            res.status(200).json({});
        }


    });
};