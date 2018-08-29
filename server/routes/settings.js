const {
  currentRotation,
  rotate,
  addInvite,
  resetRotation
} = require('../controllers/settings');
const {
  addAppointment
} = require('../controllers/appointments');
const auth = require('../controllers/users');

module.exports = (route) => {
  route.get('/rotation', auth.checkSystem, auth.verifyAccessToken, currentRotation);
  route.put('/reset', auth.checkSystem, auth.verifyAccessToken, resetRotation);
  route.put('/create-appointment', auth.checkSystem, auth.verifyAccessToken, auth.artistCount,addAppointment, rotate)

}