import Schema from 'validate'

const multiplePointsDef = {
    path: "/api/getmultiplepoints/",
    schema: new Schema({
        times: {
            type: Array,
            required: true,
            each: {type: Number}
        },
        range: {
            type: Number,
            required: false,
        },

    }),
    handler: (req, res, dbClient) => {
        res.status(200).send("kk");
    }
};

const singlePoints = {
    singlePoint: {
        path: "/api/getpoint/",
        schema: {
            time: "number;required",
            range: "number;optional=0.5"
        },
        handler: (req, res, dbClient) => {res.status(200).send("kk")}
    }
};

const apiDef = {};

function bodyVerifier(structure, body) {

}

module.exports = {apiDef, bodyVerifier};