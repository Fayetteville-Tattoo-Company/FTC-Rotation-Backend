const {
  findAppointments,
  addAppointment
} = require('../controllers/appointments');
const auth = require('../controllers/users');

module.exports = (route) => {
  route.get('/appointments', auth.checkSystem, auth.verifyAccessToken, findAppointments);
  //route.post('/create-appointment', auth.checkSystem, auth.verifyAccessToken, addAppointment);
}