const {
  currentRotation,
  rotate,
  addInvite
} = require('../controllers/settings');
const {
  addAppointment
} = require('../controllers/appointments');
const auth = require('../controllers/users');

module.exports = (route) => {
  route.get('/rotation', auth.checkSystem, auth.verifyAccessToken, currentRotation);
  route.put('/create-appointment', auth.checkSystem, auth.verifyAccessToken, auth.artistCount,addAppointment, rotate)

}