
const {email} = require('./emailer');
const Admin = require('../../data/models/AdminModel');
const Artist = require('../../data/models/ArtistModel');
const Settings = require('../../data/models/SettingsModel');
const Invite = require('../../data/models/InviteModel');
const key = process.env.KEY;
const server = process.env.SERVER;
const bcrypt = require('bcrypt');
const jwt = require('json-web-token');
const {log} = require('../../tools');


//Check Artist 
checkArtists = (user, req, next) => {
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
            if(e || !same){
              req.auth='UNAUTHORIZED';
              req.token=undefined;
              return next();
            }
            if(same){
              artist.status = 'artist';            
              req.auth = 'AUTHORIZED';
              req.token = jwt.encode(key, {artist}).value;
              req.status = 'artist';
              return next();
            }
          })
        }
        if(user.hash){
          if(user.hash !== artist.hash){
            req.auth = 'UNAUTHORIZED';
            req.token = undefined;
            return next();
          }
          if(user.hash === artist.hash){
            req.auth = 'AUTHORIZED';
            artist.status = 'artist';
            req.token = jwt.encode(key, {artist}).value;
            req.status = 'artist';
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
  if(req.status === 'unactive'){
    const access_key = jwt.decode(key, req.headers.authorization.split('Bearer ').reverse()[0]).value;
    // DB SETTINGS METHOD
    // verify system access token
    // Settings.findOne({key: 'ACCESS_TOKEN'})
    // .exec((err, setting) => {
    //   if(err || !setting) return res.json('Error Finding Setting');
    //   bcrypt.compare(token, setting.value, (err, same) => {
    //     err || !same ? req.auth = "UNAUTHORIZED" : req.auth = 'AUTHORIZED';
    //     return next();
    //   })
    // })

    // ENVIORNMENT METHOD
    bcrypt.compare(access_key, process.env.ACCESS_KEY, (err, same) => {
      err || !same ? req.auth = "UNAUTHORIZED" : req.auth = 'AUTHORIZED';
      console.log(process.env.ACCESS_KEY)
      return next();
    });




  }
  if(req.status === 'active' && req.headers.authorization) {
    req.auth = "UNAUTHORIZED";
    let user = jwt.decode(key, req.headers.authorization).value;
    if(!user) return next();
    log(user);
    user.admin ? user = user.admin : user.artist ? user = user.artist : null; 
    Admin.findOne({username: user.username})
    .exec((err, admin) => {
      if(err || !admin) return checkArtists(user, req, next);
      if(user.pass)
        bcrypt.compare(user.pass, admin.hash, (err, same) => {
          if(err || !same) return checkArtists(user, req, next);        
          
          req.auth = 'AUTHORIZED';
          req.token = jwt.encode(key, {admin}).value;
          req.status = 'admin';
          user.role === 'master' ? req.master = true : req.master = false;
          
          return next();
        });
      if(user.hash){
        user.hash !== admin.hash ? req.auth = 'UNAUTHORIZED' : req.auth = 'AUTHORIZED';
        req.token = jwt.encode(key, {admin}).value;
        req.status = 'admin';
        user.role === 'master' ? req.master = true : req.master = false;
        
        return next();
      }
    })
  }

} 

artistCount = (req, res, next) => {
  Artist.find({})
  .exec((err, artists) => {
    if(err || !artists.length){
      req.count = 0;
      return next();
    }
    req.count = artists.length;
    next(); 
  })
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
  //if(!req.auth || req.auth === 'UNAUTHORIZED') return res.send("UNAUTHORIZED");
  Admin.findOne({username: req.params.username})
  .exec((err, user) => {
    if(err || !user){
      Artist.findOne({username: req.params.username})
      .exec((e, artist) => {
        if(e || !artist) return res.json(1);
        if(artist) return res.json(0);
      })
    }
    if(user) return res.json(0);
  });
}

getArtists = (req, res) => {
  Artist.find({}).select({hash:0}).sort({location: 1})
  .exec((err, artists) => {
    if(err) return res.send(err);
    res.json(artists);
  })
}

sendMail = (req, res, next) => {
  if(!req.master || req.auth !== 'AUTHORIZED') return res.json('UNAUTHORIZED');
  const auth = {
    user: 'track7dev.testing@gmail.com',
    pass: 'PA$$W0rd',
    host: 'smtp.gmail.com'
  }
  const eMail = req.body.email ;
  const type = req.body.userType ;
  req.key = Math.floor(Math.random() * 7777777);
  bcrypt.hash(String(req.key), 11, (err, hash) => {
    if(err || !hash) return res.json(err);
    req.keyHash = hash;
    if(!err) email(auth, eMail, 'YOU HAVE BEEN INVITED', `<a href="http://${req.headers.host}/verify-invite?type=${type}&email=${eMail}&key=${req.key}">VERIFY NOW</a>`,null, req, next);
  });  
}

addInvite = (req, res) => {
  if(req.sent !== 'SUCCESS') return res.send("FAILED");
  log(req.keyHash);
  Invite.findOne({email: req.body.email})
  .exec((err, invite) => {
    if(err || !invite) {
      const newInvite = new Invite({email: req.body.email, key: req.keyHash, userType: req.body.userType});
      newInvite.save((e) => {
        if(e) return res.json(e);
        if(!e) return res.json(`SUCCESSFULLY SENT INVITE TO ${req.body.email}`);
      })
    }
    if(invite){
        invite.key = req.keyHash;
        invite.userType = req.body.userType;
        invite.save((e) => {
          if(!e) return res.send("RESENT EMAIL");
        })
    }
  })
}

createInvite = (req, res) => {
  //return res.json(req.body.key);

  Invite.findOne({email: req.body.email, userType: req.body.type})
  .exec((err, invite) => {
    if(err || !invite) return res.json('UNAUTHORIZED');
    if(invite && req.body.key){
      bcrypt.compare(req.body.key, invite.key, (e, same) => {
        if(e || !same) return res.send('NOPE');
        if(same){
          
            bcrypt.hash(req.body.pass, 11, (err, hash) => {
              if(err || !hash) return res.json('ENCRYPTION FAILURE');
              if(hash){
                const user = 
                  req.body.type === 'admin' ? 
                    new Admin({username: req.body.username, hash, name: req.body.name, role: req.body.role}) :
                  req.body.type === 'artist' ? 
                  new Artist({username: req.body.username, hash, name: req.body.name, location: req.count}) :
                  null;
                if(user)
                  user.save((er) => {
                    if(er) return res.send("FAILED TO SAVE");
                    Invite.findOneAndRemove({email: req.body.email})
                    .then((re) => log('REMOVED'))
                    .catch((err) => log('ERROR REMOVING'));

                    return res.json({status: 'SUCCESS', token: jwt.encode(key, user).value});
                  })
              }
            })
          
          
        }
      })      
    }
  })
}

verifyInvite = (req, res) => {
  Invite.findOne({email: req.query.email, userType: req.query.type})
  .exec((err, invite) => {
    if(err || !invite) return res.send("UNAUTHORIZED");
    if(invite){
      bcrypt.compare(req.query.key, invite.key, (e, same) => {
        if(e || !same) return res.send('UNAUTHORIZED');
        if(same){
          const token = jwt.encode(key, req.query).value;
          res.redirect(`${server}/#${token}`);
        }
      })      
    }
  })
}

module.exports = {
  checkSystem,
  status,
  verify,
  verifyAccessToken,
  createAdmin,
  userExist,
  getArtists,
  artistCount,
  sendMail,
  addInvite,
  verifyInvite, 
  createInvite,
  artistCount
}