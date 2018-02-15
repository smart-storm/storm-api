/**
 * Created by MD on 17/10/17.
 */
var utils=require('../../../../utils');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

module.exports = function(r){
    r.post("/",function (req,res) {
       res.json({
           logged: true
       }); //if not, jwt should not allow to get here
    });
};