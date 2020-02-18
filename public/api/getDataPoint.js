let db;
module.exports = (app, dbClient) => {
    db = dbClient;
    app.post("/api/getdatapoint/", async (req, res, next) => {
        console.log(req.body);
        if(!(req.body && req.body.time && req.body.run)) {res.status(400)}

        const time = Number(req.body.time);
        const query = await reqToQuery(req.body.time, req.body.run, req.body.range);
        let data = await db.collection("runs").find(query).toArray();
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

async function reqToQuery(time, run, range = 0.5){
    if(!run || !time) {return null;}
    return {
        time : {$lt : time + range, $gt : time - range},
        run : run,
    }
}