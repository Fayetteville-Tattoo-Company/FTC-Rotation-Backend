const {
  checkSystem,
  status,
  verify,
  verifyAccessToken,
  createAdmin
} = require('../controllers/users');

module.exports = (route) => {
  route.get('/status', checkSystem, status);
  route.get('/verify', checkSystem, verifyAccessToken, verify);
  route.post('/create-admin',checkSystem, verifyAccessToken, createAdmin);
}