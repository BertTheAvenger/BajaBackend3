const validate = require("validate");

const apiDef = {
    multiplePoints : {
        path : "/api/getmultiplepoints/",
        schema: {

        },
        handler : (req, res, dbClient) => {res.status(200).send("kk")}
    },
    singlePoint : {
        path: "/api/getpoint/",
        schema: {
            time: "number;required",
            range:"number;optional=0.5"
        },
        handler : (req, res, dbClient) => {res.status(200).send("kk")}
    }
};

function bodyVerifier(structure, body) {

}

module.exports = {apiDef, bodyVerifier};