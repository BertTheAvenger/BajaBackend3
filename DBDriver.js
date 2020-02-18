const MongoClient = require('mongodb').MongoClient;

const dbName = "baja";
const runCollection = "runs";
const metaCollection = "runmeta";

class DBDriver extends MongoClient{
    constructor(...args) {
        super(...args);
    }

    async intialize(...args) {
        super.connect(...args);

        //get the various collections
        this.DB = await this.db(dbName);
        this.runs = await this.DB.collection(runCollection);
        this.meta = await this.DB.collection(metaCollection);

        //Update each "realtime" run to be static/permanent
        await this.meta.updateMany({realTime: true}, {$set : {realTime: false, completed: true}});

        //Delete uncompleted runs - those which started to be uploaded but never finished.
        const uncompleted = await this.meta.find({completed: false}).toArray();
        if(uncompleted) {
            console.log(`Deleting ${uncompleted.length} incomplete runs.`);
            for(const v of uncompleted) {
                await this.meta.deleteOne({run: v.run});
                await this.runs.removeMany({run: v.run});
            }
        }
    }

}

module.exports = DBDriver;