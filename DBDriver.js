const MongoClient = require('mongodb').MongoClient;

const dbName = "baja";
const runCollection = "runs";
const metaCollection = "runmeta";

class DBDriver extends MongoClient {
    constructor(...args) {
        super(...args);
    }

    async initialize(...args) {
        await super.connect(...args);

        //get the various collections
        this.DB = await this.db(dbName);
        this.runs = await this.DB.collection(runCollection);
        this.meta = await this.DB.collection(metaCollection);

        /*try {
            await this.runs.drop();
            await this.meta.drop();
        } catch (e) {console.log("Collections already didn't exist.")}
        */

        console.log("Got Collections");
        //Update each "realtime" run to be static/permanent
        await this.meta.updateMany({realTime: true}, {$set: {realTime: false, completed: true}});

        this.runs.createIndex({run: -1, time: -1});
        console.log("Updated Runs");
        //Delete uncompleted runs - those which started to be uploaded but never finished.
        const uncompleted = await this.meta.find({completed: false}).toArray();
        if (uncompleted.length > 0) {
            console.log(`Deleting ${uncompleted.length} incomplete runs.`);
            for (const v of uncompleted) {
                await this.deleteRun(v.run);
            }
            console.log("Deleted incomplete");
        }

    }


    async getData(runId, times, range = .5) {
        times = times instanceof Array ? times : [times]; //Ensure times is an array, even when passed time num.

        let timeQueries = times.map(time => ({time: {$gt: time - range, $lt: time + range}}));

        //console.log(timeQueries);
        return this.runs.find({
            run: runId,
            $or: timeQueries,
        }).toArray();


    }

    async createRun(runInfo) {

    }

    async deleteRun(runId) {
        await this.meta.deleteOne({run: runId});
        await this.runs.removeMany({run: runId});
    }


}

module.exports = DBDriver;