var mongoConnectionString = "mongodb://localhost:27017/storm-db";
var jwtSecret = "SUPER_SUPER_SECRET"
var cassandraContactPoint = "127.0.0.1";
var cassandraKeyspace = "smartstorm";

module.exports = {
    mongoConnectionString,
    cassandraContactPoint,
    cassandraKeyspace,
    jwtSecret
};
