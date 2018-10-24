const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const server = express();
const path = require('path');


server.use(cors({
  origin: process.env.SERVER,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  optionsSuccessStatus: 200 
}));
server.use(express.json());

server.use('/static',express.static(__dirname + '/uploads'), (req, res) => {
 
});
server.get('/image/:type/:username', (req, res) => {
  
  res.sendFile(path.resolve(__dirname, `../uploads/${req.params.type}/${req.params.username}/profile.png`));
});

require('./routes')(server);

module.exports = server;
