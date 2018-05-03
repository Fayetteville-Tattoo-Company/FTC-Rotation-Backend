const jwt = require('json-web-token');
const key = process.env.KEY;
const multer = require('multer');

const storage = multer.diskStorage({destination:(req, file, cb) => {
  if(!req.token) return cb('UNATHORIZED ACCESS', null);
  const user = jwt.decode(key, req.token).value;
  multer({dest: `uploads/${user.admin ? 'admin' : user.artist ? 'artist' : 'unknown'}/${user.admin ? user.admin.username : user.artist ? user.artist.username : 'unknown'}`});
  cb(null, `./uploads/${user.admin ? 'admin' : user.artist ? 'artist' : 'unknown'}/${user.admin ? user.admin.username : user.artist ? user.artist.username : 'unknown'}`);
},
  filename: (req, file, cb) => {
    if(!req.token) return cb('UNATHORIZED ACCESS', null);
    const user = jwt.decode(key, req.token).value;
    cb(null, `profile.png`);
  }
});
const upload = multer({storage:storage});

const fs = require('fs');

const imageUpload = (req, res) => !req.token ? res.json('EROORRRRRR') : res.json({token: req.token});


const getImage = (req, res) => {
  if(req.token) return res.send('UNAUTHORIZED');
  const user = jwt.decode(key, teq.token).value;
  res.sendFile(require(`../uploads/${user.admin ? 'admin' : user.artist ? 'artist' : 'unknown'}/${user.username}`));
};


const deleteImg =  (req, res) => {
  if(!req.master) return res.send('UNAUTHORIZED');
  fs.unlink('./uploads/'+ req.params.name, (err) => err ? res.json('failed') : res.json('success'));
};

module.exports = {
  deleteImg,
  imageUpload,
  upload,
  getImage
}