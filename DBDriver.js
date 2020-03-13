const MongoClient = require('mongodb').MongoClient;

const dbName = "baja";
const runCollection = "runs";
const metaCollection = "runmeta";

class DBAccessor extends MongoClient {
    constructor(...args) {
        super(...args);
        this.dbRuns = [];
    }

    async initialize(...args) {
        await super.connect(...args);

        //get the various collections
        this.DB = await this.db(dbName);
        this.runs = await this.DB.collection(runCollection);
        this.meta = await this.DB.collection(metaCollection);

        console.log("Got Collections");

        //Create a linked DBRun instance for each run in the meta collection.
        for(const metaEntry of await this.meta.find({}).toArray()) {
            this.dbRuns.push(await new DbRun.Builder()
                .metaCollection(this.meta)
                .runCollection(this.runs)
                .runId(metaEntry.run)
                .build()
            )
        }
        console.log(this.dbRuns);
    /*
        //Update each "realtime" run to be static/permanent
        await this.meta.updateMany({realTime: true}, {$set: {realTime: false, completed: true}});

        this.runs.createIndex({run: -1, time: -1});
        console.log("Updated Runs");

        //Delete uncompleted runs - those which started to be uploaded but never finished.
        const uncompleted = await this.meta.find({completed: false}).toArray();
        if (uncompleted.length > 0) {
            console.log(`Dele3ting ${uncompleted.length} incomplete runs.`);
            for (const v of uncompleted) {
                await this.deleteRun(v.run);
            }
            console.log("Deleted incomplete");
        }
*/
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

}


class DBRunBuilder {
    constructor() {
        return this;
    }

    fromMeta(metaData){
        this.metaData = metaData;
        return this;
    }

    runId(id){
        this.id = id;
        return this;
    }

    metaCollection(meta){
        this.meta = meta;
        return this;
    }

    runCollection(runs){
        this.runs = runs;
        return this;
    }

    async build(){
        //Data verification
        let assert = (assertion, errMsg) => {
            if(!assertion){
                console.error(`Error creating DbRun: ${errMsg}`);
            }
        };

        assert(this.meta, "MetaCollection is required for DbRun creation!");
        assert(this.runs, "RunCollection is required for DbRun creation!");
        assert(this.id, "runId is required for DbRun creation!");

        return new DbRun()
            .setMetaCollection(this.meta)
            .setRunCollection(this.runs)
            .setRunId(this.id)
            .initialize();
    }
}


class DbRun {
    constructor() {
        return this;
    }

    setMetaCollection(metaCollection) {
        this.metaCollection = metaCollection;
        return this;
    }

    setRunCollection(runCollection) {
        this.runCollection = runCollection;
        return this;
    }

    setRunId(runId) {
        this.runId = runId;
        return this;
    }

    async initalize(){
        let foundRun = await this.metaCollection.find({
            run: this.runId
        }).toArray();
        if(foundRun.length > 0) {


        } else { //Run with ID doesn't already exist, create one.
            await this.metaCollection.insertOne({
                run: this.runId,
                size: -1,
                fileName: "",
                realTime: false,
                completed: false,
                timeIngested: -1
            });
        }
    }

    static Builder = DBRunBuilder;


}


module.exports = DBAccessor;