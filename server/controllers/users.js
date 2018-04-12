
const Admin = require('../../data/models/AdminModel');
const Artist = require('../../data/models/ArtistModel');
const Settings = require('../../data/models/SettingsModel');
const key = require('../config.json').secret;
const bcrypt = require('bcrypt');
const jwt = require('json-web-token');

//Check Artist 
checkArtists = (user, req, next) => {
  console.log('CHECKING ARTISTS');
  if(user)
    Artist.findOne({username: user.username})
    .exec((err, artist) => {
      if(err || !artist){
        req.auth = 'UNAUTHORIZED';
        req.token = undefined;
        return next();
      }

      if(artist){
        if(user.pass){
          bcrypt.compare(user.pass, artist.hash, (e, same) => {
            console.log(user.pass);
            if(e || !same){
              console.log('Not Found');              
              req.auth='UNAUTHORIZED';
              req.token=undefined;
              return next();
            }
            if(same){
              console.log('Found');
              artist.status = 'artist';            
              req.auth = 'AUTHORIZED';
              req.token = jwt.encode(key, {artist}).value;
              return next();
            }
          })
        }
        if(user.hash){
          if(user.hash !== artist.hash){
            console.log('Not Found');
            req.auth = 'UNAUTHORIZED';
            req.token = undefined;
            return next();
          }
          if(user.hash === artist.hash){
            console.log('Found');
            req.auth = 'AUTHORIZED';
            artist.status = 'artist';
            req.token = jwt.encode(key, {artist}).value;
            return next();
          }
        }
      }
    })
}

// Middleware
const checkSystem = (req, res, next) => {
  Admin.find({})
  .exec((err, r) => { 
    err || !r.length ?  req.status = 'unactive' : req.status = 'active';
    return next();
  });
}

const verifyAccessToken = (req, res, next) => {
  if(!req.headers.authorization) return res.send('ACCESS TOKEN REQUIRED');
  const token = req.headers.authorization.split('Bearer ').reverse()[0];
  console.log(token);
  if(req.status === 'unactive'){
    // verify system access token
    Settings.findOne({key: 'ACCESS_TOKEN'})
    .exec((err, setting) => {
      if(err || !setting) return res.json('Error Finding Setting');
      bcrypt.compare(token, setting.value, (err, same) => {
        err || !same ? req.auth = "UNAUTHORIZED" : req.auth = 'AUTHORIZED';
        console.log(req.auth);
        return next();
      })
    })
  }
  if(req.status === 'active') {
    req.auth = "UNAUTHORIZED";
    let user = jwt.decode(key, req.headers.authorization).value;
    if(!user) return next();
    console.log(user);
    user.admin ? user = user.admin : user.artist ? user = user.artist : null; 
    Admin.findOne({username: user.username})
    .exec((err, admin) => {
      if(err || !admin) return checkArtists(user, req, next);
      if(user.pass)
        bcrypt.compare(user.pass, admin.hash, (err, same) => {
          if(err || !same) return checkArtists(user, req, next);        
          
          req.auth = 'AUTHORIZED';
          req.token = jwt.encode(key, {admin}).value;
          return next();
        });
      if(user.hash){
        user.hash !== admin.hash ? req.auth = 'UNAUTHORIZED' : req.auth = 'AUTHORIZED';
        req.token = jwt.encode(key, {admin}).value;
        return next();
      }
    })
  }

} 

// Routes
const status = (req, res) => res.send(req.status);
const verify = (req, res) => {
  res.send({access:req.auth, token: req.token});
}


const createAdmin = (req, res) => {
  if(!req.auth || req.auth === 'UNAUTHORIZED') return res.send("UNAUTHORIZED");
  const {username, name, password} = jwt.decode(key, req.body.token).value;
  bcrypt.hash(password, 11, (err, hash) => {
    if(err || !hash) return res.send('FAILED TO ENCRYPT');
    const admin = new Admin({username, name, hash});
    admin.save((e) => {
      if(e) return res.json(e);
      const token = jwt.encode(key, {admin}).value;
      res.json({access: req.auth, token});
    });
  });
}

const userExist = (req, res) => {
  if(!req.auth || req.auth === 'UNAUTHORIZED') return res.send("UNAUTHORIZED");
  Admin.findOne({username: req.params.username})
  .exec((err, user) => {
    if(err || !user){
      return res.json(1);
    }
    if(user) return res.json(0);
  });
}

module.exports = {
  checkSystem,
  status,
  verify,
  verifyAccessToken,
  createAdmin,
  userExist
}