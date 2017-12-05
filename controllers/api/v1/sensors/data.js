
var utils=require('../../../../utils');
var	ObjectID = require('mongodb').ObjectID;

module.exports = function(r){
    r.post("/byUser",function (req,res) {
        var client = utils.getCassandraConnection();
        client.execute("SELECT * FROM sensors WHERE sensorid=? AND userid=?", [req.body.sensor, req.body.user]).then( result => res.json(result.rows));
    });

    r.post("/",function (req,res) {
        var client = utils.getCassandraConnection();
        var user = utils.getUserFromToken(req);
        client.execute("SELECT * FROM sensors WHERE sensorid=? AND userid=?", [req.body.sensor, user]).then( result => res.json(result.rows));
    });

};