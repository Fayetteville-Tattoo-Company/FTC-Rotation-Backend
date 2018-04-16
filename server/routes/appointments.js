const {
  findAppointments,
  addAppointment,
  removeAppointment
} = require('../controllers/appointments');
const auth = require('../controllers/users');

module.exports = (route) => {
  route.get('/appointments', auth.checkSystem, auth.verifyAccessToken, findAppointments);
  route.delete('/remove-appointment/:id', auth.checkSystem, auth.verifyAccessToken, removeAppointment);
}