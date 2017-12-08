var utils = require('./utils');

var socket_interval = 30000;
var refreshIntervalId = null;

var fetchData = function(socket, user, lastTimes){

    console.log(lastTimes);

    utils.getDbConnection().then((db)=>{
        db.collection('sensors').find({user_id:user.id, display_chart:true}).toArray((err,data)=>{
            if(err) {
                console.log('Error getting sensor list:'+err);
                socket.emit('error_msg', {
                    body: "Error getting sensor list, try again later"
                });
                socket.disconnect();
                clearInterval(refreshIntervalId);
            }
            else {
                var sensorsInfo = [];
                var client = utils.getCassandraConnection();
                var promises = [];
                for(var i=0; i < data.length; i++){
                    var sensorid = data[i]._id+'';
                    var sensorname = data[i].name;
                    sensorsInfo.push({
                        sensor_id: sensorid,
                        sensor_name: sensorname
                    });
                    if(false){ //testing condition purpose
                        if(!lastTimes[0]) promises.push(client.execute("SELECT * FROM sensors WHERE sensorid=? AND userid=? AND created_epoch>?", [sensorid, user.id, 0], { prepare : true }));
                        else promises.push(client.execute("SELECT * FROM sensors WHERE sensorid=? AND userid=? AND created_epoch>?", [sensorid, user.id, lastTimes[0][i]], { prepare : true }));
                    } else {
                        promises.push(client.execute("SELECT * FROM sensors"));
                    }
                }
                Promise.all(promises).then((results) => {
                    var lastTime = [];
                    lastTimes.length = 0;
                    for(var i=0; i < results.length; i++){
                        results[i].information = sensorsInfo[i];
                        if(results[i].rowLength > 0) lastTime.push(results[i].rows[0].created_epoch);
                    }
                    lastTimes.push(lastTime);
                    socket.emit("chartsdata", results);
                }).catch((err) => {
                    socket.emit('error_msg', {
                        body: "Cassandra connection error, try again later"
                    });
                    socket.disconnect();
                    clearInterval(refreshIntervalId);
                });
            }
            db.close();
        });

    }).catch((err)=>{
        console.log('Error connecting ');
    });
};

module.exports.listen = function(socket) {

    var token = socket.conn.request._query.auth_token;

    try {
        var user = utils.getUserFromToken(null, token);
        if(!user){
            socket.emit('error_msg', {
                body: "User not found, or token expired"
            });
            socket.disconnect();
        }
    } catch(err) {
        socket.emit('error', err);
        socket.disconnect();
    }

    var lastRecordTimes = [];

    fetchData(socket, user, lastRecordTimes);
    refreshIntervalId = setInterval(function () {
       fetchData(socket, user, lastRecordTimes);
    }, socket_interval);

    socket.on('disconnect', function() {
        clearInterval(refreshIntervalId);
    });


    return socket;
};


