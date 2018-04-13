const {
  checkSystem,
  status,
  verify,
  verifyAccessToken,
  createAdmin,
  userExist,
  getArtists,
  sendMail, 
  addInvite,
  verifyInvite,
  createInvite, 
  artistCount
} = require('../controllers/users');

module.exports = (route) => {
  route.get('/status', checkSystem, status);
  route.get('/verify', checkSystem, verifyAccessToken, verify);
  route.get('/exist/:username', checkSystem, userExist);
  route.get('/artists', checkSystem, verifyAccessToken, getArtists);
  route.post('/create-admin',checkSystem, verifyAccessToken, createAdmin);
  route.post('/invite-signup', checkSystem,artistCount, createInvite);
  route.post('/invite',checkSystem, verifyAccessToken, sendMail, addInvite);
  route.get('/verify-invite', checkSystem, verifyInvite);
 
}