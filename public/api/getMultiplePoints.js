
let db;
module.exports = (app, dbClient) => {
    db = dbClient;
    app.post("/api/getmultipledatapoint/", async (req, res, next) => {
        console.log(req.body);
        if(!(req.body && req.body.times && req.body.run)) {res.status(400)}

        const runs = await db.collection("runs");

        const times = req.times.map(v => Number(v));

        const points = await runs.find({run: req.body.run, time: {$in : times}});
        console.log(points);

        res.status(200);
        /*if(toSend) {
            delete toSend._id;
            console.log(toSend);
            res.status(200).json(toSend);
        } else {
            res.status(200).json({});
        }
*/

    });
};