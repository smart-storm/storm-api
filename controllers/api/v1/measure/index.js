/**
 * Created by jwszol on 29/07/17.
 */


'use strict';
var utils=require('../../../../utils');
var async=require('async')
var kafka = require('kafka-node');
var HighLevelProducer = kafka.HighLevelProducer;
var KeyedMessage = kafka.KeyedMessage;
var Client = kafka.Client;
var	ObjectID = require('mongodb').ObjectID;


module.exports = function (router) {


    /* @apiParamExample {json} Request-Example:
     * {
     * 	"user_id":"name@test.com",
     * 	"sensor_id":"59f097013246b0178f5ecac1",
     *   "desc":"sensor description",
     *   "measure_value":123
     * }
     */
    router.post('/', function (req, res) {

        if (typeof req.body.user_id === 'undefined' || typeof req.body.sensor_id === 'undefined' ||
            typeof req.body.desc === 'undefined' || typeof req.body.measure_value === 'undefined') {
            res.status(400).send('JSON object is not defined.');
        }

        async.waterfall([

            function(callback){
                getUserId(req.body.user_id).then(
                    function (results) {
                        if(results) {
                            callback(null, results);
                        }else{
                            res.sendStatus(404);
                        }
                    }
                )
            },

            function(userDocument, callback){
                console.log(userDocument._id)
                getSensorId(userDocument._id, req.body.sensor_id).then(function (results) {
                    if(results) {
                        callback(null, results)
                    }else{
                        res.sendStatus(404);
                    }
                })
            },

            //send to kafka queue
            function(sensorDocument, callback){
                var sensorId = sensorDocument._id.toString()
                var userId = sensorDocument.user_id.toString()
                var value = req.body.measure_value.toString()
                var currentData = new Date().toLocaleString();
                //
                var objectToSend = {"sensorId": sensorId, "userId": userId, "value": value, "currentData": currentData}
                console.log(objectToSend)
                
                var kafka = require('kafka-node'),
                    HighLevelProducer = kafka.HighLevelProducer,
                    client = new kafka.Client('localhost:2181', 'rest-service', {
                            sessionTimeout: 300,
                            spinDelay: 100,
                            retries: 2
                        }),
                    producer = new HighLevelProducer(client),
                    payloads = [
                        { topic: 'smart_msq', messages: JSON.stringify(objectToSend), partition: 0 }
                    ];

                producer.on('ready', function () {
                    producer.send(payloads, function (err, data) {
                        if(data){
                            callback(null, data)
                        }else{
                            res.sendStatus(500);
                        }
                    });
                });


            }],

            function(err, results){
                console.log(results)
                res.sendStatus(200);
            }
            )
    });



    function getUserId (email){
        return new Promise(function(resolve, reject) {
            var db = utils.getDbConnection().then((db) => {
                    db.collection('users').findOne({"email": email}, function (err, document) {
                    if (err) {
                        res.sendStatus(500);
                    }

                    console.log(document)

                    if (document) {
                        resolve(document)
                    }else{
                        resolve(null)
                    }
                    db.close();

                })
        }).catch((err) => {
                console.log('Error connecting to: db');
            })})};


    function getSensorId (userId, sensorId){
        return new Promise(function(resolve, reject) {
            var db = utils.getDbConnection().then((db) => {
                    db.collection('sensors').findOne({"user_id": userId.toString(), "_id":ObjectID.createFromHexString(sensorId.toString())},
                    function (err, document) {
                        if (err) {
                            res.sendStatus(500);
                        }

                        if (document) {
                            resolve(document)
                        }else{
                            resolve(null)
                        }
                        db.close();
                    })
        }).catch((err)=> {
                console.log('Error connecting to: db');
            })})};


};
