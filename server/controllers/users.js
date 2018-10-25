
const {email} = require('./emailer');
const Admin = require('../../data/models/AdminModel');
const Artist = require('../../data/models/ArtistModel');
const Settings = require('../../data/models/SettingsModel');
const Invite = require('../../data/models/InviteModel');
const key = process.env.KEY;
const server = process.env.SERVER;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {log} = require('../../tools');

const multer = require('multer');

const storage = multer.diskStorage({destination:(req, file, cb) => {
  //if(!req.verified || !req.token) return cb('UNATHORIZED ACCESS', null);
  //const user = jwt.decode(req.token, secret);
  //multer({dest: `uploads/${user.status}/${user.username}`});
  //cb(null, `./uploads/${user.status}/${user.username}`);
  console.log(req.file);
},
  filename: (req, file, cb) => {
   // if(!req.verified || !req.token) return cb('UNATHORIZED ACCESS', null);
    //const user = jwt.decode(req.token, secret);
   // cb(null, `profile.jpg`);
   console.log(req.file);
  }
});
const upload = multer({storage:storage});
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
              req.token = jwt.sign({artist},key);
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
            req.token = jwt.sign({artist},key);
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
    const access_key = jwt.decode(req.headers.authorization.split('Bearer ').reverse()[0], key);

    // ENVIORNMENT METHOD
    bcrypt.compare(token, process.env.ACCESS_KEY, (err, same) => {
      err || !same ? req.auth = "UNAUTHORIZED" : req.auth = 'AUTHORIZED';
      return next();
    });




  }
  if(req.status === 'active' && req.headers.authorization) {
    req.auth = "UNAUTHORIZED";
    let user = jwt.decode(req.headers.authorization, key);
    //user = jwt.decode(key, user).value;
    if(!user) return next();
    //log(user);
    user.admin ? user = user.admin : user.artist ? user = user.artist : null; 
    Admin.findOne({username: user.username})
    .exec((err, admin) => {
      if(err || !admin) return checkArtists(user, req, next);
      if(user.pass)
        bcrypt.compare(user.pass, admin.hash, (err, same) => {
          if(err || !same) return checkArtists(user, req, next);        
          
          req.auth = 'AUTHORIZED';
          req.token = jwt.sign({admin},key);
          req.status = 'admin';
          user.role === 'master' ? req.master = true : req.master = false;
          
          return next();
        });
      if(user.hash){
        user.hash !== admin.hash ? req.auth = 'UNAUTHORIZED' : req.auth = 'AUTHORIZED';
        req.token = jwt.sign({admin}, key);
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
  let master = false;
  Admin.find({}, (err, admins) => {
    if(err || !admins.length) master = true;
    const {username, name, password} = jwt.decode(req.body.token, key);
  bcrypt.hash(password, 11, (err, hash) => {
    if(err || !hash) return res.send('FAILED TO ENCRYPT');
    const admin = new Admin({username, name, hash, role: master ? 'master' : 'admin'});
    admin.save((e) => {
      if(e) return res.json(e);
      const token = jwt.sign({admin}, key);
      res.json({access: req.auth, token});
    });
  });
  })
  
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
    user: process.env.E_USER,
    pass: process.env.E_PASS,
    service: process.env.E_SERVICE
  }
  const eMail = req.body.email ;
  const type = req.body.userType ;
  req.key = Math.floor(Math.random() * 7777777);
  bcrypt.hash(String(req.key), 11, (err, hash) => {
    if(err || !hash) return res.json(err);
    req.keyHash = hash;
    console.log(res);
    if(!err) email(auth, eMail, 'YOU HAVE BEEN INVITED', `<a href="${process.env.NODE_ENV === 'production' ? 'https://' : 'http://'}${req.headers.host}/verify-invite?type=${type}&email=${eMail}&key=${req.key}">VERIFY NOW</a>`,null, req, next);
  });  
}

addInvite = (req, res) => {
  if(req.sent !== 'SUCCESS') return res.send("FAILED");
  log(req.keyHash);
  log(req.body);
  Invite.findOne({email: req.body.email})
  .exec((err, invite) => {
    if(err || !invite) {
      const newInvite = new Invite({email: req.body.email, key: req.keyHash, userType: req.body.userType});
      newInvite.save((e) => {
        if(e) return res.json(e + 'save error');
        
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

  Invite.findOne({email: req.body.email, userType: req.body.type})
  .exec((err, invite) => {
    if(err || !invite) return res.json('UNAUTHORIZED');
    console.log(" ===>" ,req.body);
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

                    return res.json({status: 'SUCCESS', token: jwt.sign({user},key)});
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
          const token = jwt.sign(req.query, key);
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
  artistCount,
  upload
}