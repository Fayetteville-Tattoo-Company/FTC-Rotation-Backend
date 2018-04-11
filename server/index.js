const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const server = express();

server.use(express.json());
server.use(cors());

require('./routes')(server);

module.exports = server;