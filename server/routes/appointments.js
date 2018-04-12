const {
  findAppointments
} = require('../controllers/appointments');
const auth = require('../controllers/users');

module.exports = (route) => {
  route.get('/appointments', auth.checkSystem, auth.verifyAccessToken, findAppointments);
}