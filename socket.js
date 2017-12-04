var utils = require('./utils');

var socket_interval = 10000;

var fetchData = function(socket, user, lastTimes){
    utils.getDbConnection().then((db)=>{

        db.collection('sensors').find({user_id:user.id, display_chart:true}).toArray((err,data)=>{
            if(err) {
                console.log('Error getting sensor list:'+err);
            }
            else {

                if(lastTimes[0]) console.log(lastTimes[0][0][0]);

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
                    console.log("szukam: " + sensorid + "   " + user.id);

                    if(false){
                        if(!lastTimes[0]) promises.push(client.execute("SELECT * FROM sensors WHERE sensorid=? AND userid=? AND created_epoch>?", [sensorid, user.id, 15], { prepare : true }));
                        else promises.push(client.execute("SELECT * FROM sensors WHERE sensorid=? AND userid=? AND created_epoch>?", [sensorid, user.id, lastTimes[0][0][i]], { prepare : true }));
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
                        else lastTime.push(0);
                    }
                    lastTimes.push([lastTime]);
                    socket.emit("chartsdata", results);
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
    } catch(err) {
        socket.emit('error', err);
        socket.disconnect();
    }

    var lastRecordTimes = []

    fetchData(socket, user, lastRecordTimes);
    setInterval(function () {
       fetchData(socket, user, lastRecordTimes);
    }, socket_interval);




    // var last_record_time = null;
    //
    // utils.getCassandraConnection().execute("SELECT * FROM sensors_view WHERE userid=? AND sensorid=?", [user.id, "sensor"]).then( (res) => {
    //     socket.emit("chartsdata", res);
    //     last_record_time = 0;
    // });

    socket.on('message', function(msg){
            console.log('message: ' + msg);
    });

    // setInterval(function(){
    //     utils.getCassandraConnection().execute("SELECT * FROM sensors_view").then( (res) => {
    //         socket.emit("chartsdata", res);
    //     });
    // },socket_interval);

    return socket;
};


