var utils = require('./utils');

var socket_interval = 10000;

module.exports.listen = function(socket) {

    var token = socket.conn.request._query.auth_token;

    try {
        var user = utils.getUserFromToken(null, token);
        console.log(user);
    } catch(err) {
        socket.emit('error', err);
        socket.disconnect();
    }

    var last_record_time = null;

    utils.getCassandraConnection().execute("SELECT * FROM sensors_view").then( (res) => {
        socket.emit("chartsdata", res);
        last_record_time[0]
    });

    socket.on('message', function(msg){
            console.log('message: ' + msg);
    });

    setInterval(function(){
        utils.getCassandraConnection().execute("SELECT * FROM sensors_view").then( (res) => {
            socket.emit("chartsdata", res);
        });
    },socket_interval);

    return socket;
};