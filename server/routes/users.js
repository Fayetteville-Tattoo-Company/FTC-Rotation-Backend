const {
  checkSystem,
  status,
  verify,
  verifyAccessToken,
  createAdmin,
  userExist
} = require('../controllers/users');

module.exports = (route) => {
  route.get('/status', checkSystem, status);
  route.get('/verify', checkSystem, verifyAccessToken, verify);
  route.get('/exist/:username', checkSystem, verifyAccessToken, userExist);
  route.post('/create-admin',checkSystem, verifyAccessToken, createAdmin);

}