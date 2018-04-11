const Admin = require('../../data/models/AdminModel');
const Settings = require('../../data/models/SettingsModel');
const key = require('../config.json').secret;
const bcrypt = require('bcrypt');
const jwt = require('json-web-token');

// Middleware
const checkSystem = (req, res, next) => {
  Admin.find({})
  .exec((err, r) => { 
    err || !r.length ?  req.status = 'unactive' : req.status = 'active';
    next();
  });
}

const verifyAccessToken = (req, res, next) => {
  if(!req.headers.authorization) res.json('ACCESS TOKEN REQUIRED');
  const token = req.headers.authorization.split('Bearer ').reverse()[0];
  if(req.status === 'unactive'){
    // verify system access token
    Settings.findOne({key: 'ACCESS_TOKEN'})
    .exec((err, setting) => {
      if(err || !setting) return res.json('Error Finding Setting');
      bcrypt.compare(token, setting.value, (err, same) => {
        err || !same ? res.auth = "UNAUTHORIZED" : req.auth = 'AUTHORIZED';
        next();
      })
    })
  }
  if(req.status === 'active') {
    req.auth = "UNAUTHORIZED";
    const test = jwt.encode(key, {username: 'bob', pass: 'bob'}).value;
    const user = jwt.decode(key, req.headers.authorization).value;
    console.log(test);
    if(!user) return next();
    Admin.findOne({username: user.username})
    .exec((err, admin) => {
      if(err || !admin) {
        // CHECK ARTISTS
        console.log("no admin found by that name");
        return next();
      };
      bcrypt.compare(user.pass, admin.hash, (err, same) => {
        if(err || !same) {
          // CHECK ARTISTS
          console.log("admin hash unmatched"); 
          return next()         
        }
        req.auth = 'AUTHORIZED';
        return next();
      });
    })
  }

} 

// Routes
const status = (req, res) => res.send(req.status);
const verify = (req, res) => {
  res.send(req.auth);
}


const createAdmin = (req, res) => {
  if(!req.auth || req.auth === 'UNAUTHORIZED') return res.send("UNAUTHORIZED");
  res.send(req.auth);

}

module.exports = {
  checkSystem,
  status,
  verify,
  verifyAccessToken,
  createAdmin

}