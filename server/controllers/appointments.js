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
    .sort({createdAt: -1})
    .populate({path: 'rotationID', populate: {path: 'artist', select:{username: 1, name: 1}, model: Artist}})
    .exec((err, appointments) => {
      if(err || !appointments.length) return res.json([]);
      if(user.admin) return res.send(appointments);
      if(user.artist) return res.send(appointments.filter((appointment) => {
        console.log(appointment.rotationID.artist.username, user.artist.username);
        return appointment.rotationID.artist.username === user.artist.username
      }));
    });   
     
  }
}

addAppointment = (req, res, next) => {
  if(req.auth !== 'AUTHORIZED' || req.status !== 'admin') return res.send('UNAUTHORIZED');
  const creator = jwt.decode(key, req.headers.authorization).value;
  const newRotation = new Rotation({artist: req.body.artist});
  newRotation.save((err) => {
    const newAppointment = new Appointment({client: req.body.client, number: req.body.number, date: req.body.date, time: req.body.time, rotationID: newRotation._id, createdAt: Date.now()});
    newAppointment.save((e) => {
      console.log('CREATED');
      return next();
    });
  })
}

module.exports = {
  findAppointments,
  addAppointment
}