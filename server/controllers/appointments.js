const Appointment = require('../../data/models/AppointmentModel');
const Rotation = require('../../data/models/RotationModel');
const Artist = require('../../data/models/ArtistModel');
const {log} = require('../../tools');
const jwt = require('jsonwebtoken');
const key = process.env.KEY;


const findAppointments = (req, res) => {
  if(!req.auth || req.auth === 'UNAUTHORIZED' || !req.token) return res.send('UNAUTHORIZED');
  if(req.auth === 'AUTHORIZED'){
    const user = jwt.decode(key, req.token);
    
   
    Appointment.find({})
    .sort({createdAt: -1})
    .populate({path: 'rotationID', populate: {path: 'artist', select:{username: 1, name: 1}, model: Artist}})
    .exec((err, appointments) => {
      if(err || !appointments.length) return res.json([]);
      if(user.admin) return res.send(appointments);
      if(user.artist) return res.send(appointments.filter((appointment) => {
        log(appointment.rotationID.artist.username, user.artist.username);
        return appointment.rotationID.artist.username === user.artist.username
      }));
    });   
  }
}

addAppointment = (req, res, next) => {
  if(req.auth !== 'AUTHORIZED' || req.status !== 'admin') return res.send('UNAUTHORIZED');
  const creator = jwt.decode(key, req.headers.authorization);
  const newRotation = new Rotation({artist: req.body.artist});
  newRotation.save((err) => {
    const newAppointment = new Appointment({client: req.body.client, number: req.body.number, date: req.body.date, time: req.body.time, rotationID: newRotation._id, createdAt: Date.now()});
    newAppointment.save((e) => {
      log('CREATED');
      return next();
    });
  })
}

removeAppointment = (req, res) => {
  if(!req.master) return res.send('UNAUTHORIZED');
  Appointment.findByIdAndRemove(req.params.id)
  .exec((err, appointment) => {
    res.send(req.params.id + " REMOVED");
    
  });
}

module.exports = {
  findAppointments,
  addAppointment, 
  removeAppointment
}