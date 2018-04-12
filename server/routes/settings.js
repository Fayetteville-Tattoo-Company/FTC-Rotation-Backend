const {
  currentRotation,
  rotate
} = require('../controllers/settings');
const auth = require('../controllers/users');

module.exports = (route) => {
  route.get('/rotation', auth.checkSystem, auth.verifyAccessToken, currentRotation);
  route.put('/rotation', auth.checkSystem, auth.verifyAccessToken, auth.artistCount, rotate)
}