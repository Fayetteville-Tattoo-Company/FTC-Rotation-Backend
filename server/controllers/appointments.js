const Appointment = require('../../data/models/AppointmentModel');
const Rotation = require('../../data/models/RotationModel');
const Artist = require('../../data/models/ArtistModel');
const jwt = require('json-web-token');
const key = require('../config.json').secret;

const findAppointments = (req, res) => {
  if(!req.auth || req.auth === 'UNAUTHORIZED') return res.send('UNAUTHORIZED');
  if(req.auth === 'AUTHORIZED'){
    const user = jwt.decode(key, req.token).value;
    
   
    Appointment.find({})
    .populate({path: 'rotationID', populate: {path: 'artist', select:{username: 1, name: 1}, model: Artist}})
    .exec((err, appointments) => {
      if(err || !appointments.length) return res.send('NO APPOINTMENTS FOUND');
      if(user.admin) return res.send(appointments);
      if(user.artist) return res.send(appointments.filter((appointment) => {
        console.log(appointment.rotationID.artist.username, user.artist.username);
        return appointment.rotationID.artist.username === user.artist.username
      }));
    });   
     
  }
}

module.exports = {
  findAppointments
}