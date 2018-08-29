const Settings = require('../../data/models/SettingsModel');
const Artist = require('../../data/models/ArtistModel');
const key = process.env.KEY;


currentRotation = (req, res) => {
  if(req.auth !== 'AUTHORIZED') return res.send('UNAUTHORIZED');
  Settings.findOne({key: 'ROTATION'})
  .exec((err, setting) => {
    if(err || !setting) return res.send('SETTING NOT FOUND');
    res.json(setting.value);
  })
}
resetRotation = (req, res) => {
  if(req.auth !== 'AUTHORIZED') return res.send('UNAUTHORIZED');
  Settings.findOne({key: 'ROTATION'})
  .exec((err, setting) => {
    if(err) return res.send(err.message);
    setting.value = 0;
    setting.save((e) => {
      if(!e) res.json('COUNT RESET');
    });
    
  })
}



rotate = (req, res) => {
  if(req.status !== 'admin') return res.send('UNAUTHORIZED');
  Settings.findOne({key: 'ROTATION'})
  .exec((err, setting) => {
    if(err || !setting) return res.send('SETTING NOT FOUND');
    setting.value++;
    if(setting.value >= req.count) setting.value = 0;
    setting.save((e) => {
      if(e) return res.send('SETTING ERROR');
      return res.json(setting.value);
    });
  });
}


module.exports = {
  currentRotation,
  rotate,
  addInvite,
  resetRotation
}
