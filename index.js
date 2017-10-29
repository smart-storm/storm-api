'use strict';

var express = require('express');
var kraken = require('kraken-js');
var basicAuth = require('express-basic-auth');
var cors = require('cors'); 
var expressJwt = require('express-jwt');

var utils=require('./utils');

var options, app;
// var mongo = require('mongodb');
/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
    onconfig: function (config, next) {
        /*
         * Add any additional config setup or overrides here. `config` is an initialized
         * `confit` (https://github.com/krakenjs/confit/) configuration object.
         */
        next(null, config);
    }
};



app = module.exports = express();
app.use(kraken(options));


var whitelist = ['http://localhost:4300', 'http://alfa.smartstorm.io']
var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use('/api/v1/users',cors(corsOptions));
app.use('/api/v1/sensors',cors(corsOptions)); 

app.use(function(req,res,next){
  console.log(new Date().toUTCString()+' '+req.originalUrl);
  next();
})

app.use('/api/*',expressJwt({
    secret: utils.getSecret,
    getToken: utils.getToken,
    // isRevoked: function(req,payload,done){

    // }
}).unless({ path: ['/api/v1/users/authenticate','/api/v1/users/register','/api/v1/measure' ] }));



app.use(function (err, req, res, next) {
  // if (err.name === 'UnauthorizedError') {
  //   // res.status(401).send('invalid token...');
  //   res.sendStatus(401);
  // }
  console.log(req.ip+' - ['+new Date().toUTCString()+'] '+err.name+' - '+
    req.headers.host+' - "'+req.method+' '+req.originalUrl+'" - "'+ 
    req.headers["user-agent"]+'"');

  if(err.status!==undefined)
    res.sendStatus(err.status);
  else
    res.sendStatus(500);
});


app.on('start', function () {
    console.log('Application ready to serve requests.');
    console.log('Environment: %s', app.kraken.get('env:env'));
});
