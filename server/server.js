const server = require('./');
const mongoose = require('mongoose');
const {log} = require('../tools');
const port = process.env.PORT || 5000;
const mongoURI = process.env.NODE_ENV === "production" && process.env.MONGODB_URI ? process.env.MONGODB_URI : process.env.DBTEST || null;
mongoose.Promise = global.Promise;
const connect = mongoose.connect(mongoURI);
connect.then(() => {
  log("MongoDB Server Running : 7777");
  server.listen(port, () => log(`Main Server Running : ${port} --> ${process.env.NODE_ENV} : DB ${process.env.DBTEST}`));
})
.catch((err) => log("ERROR STARTING SERVERS", err));

