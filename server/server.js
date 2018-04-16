const server = require('./');
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:7777/test'
mongoose.Promise = global.Promise;
const connect = mongoose.connect(mongoURI);
connect.then(() => {
  console.log("MongoDB Server Running : 7777");
  server.listen(port, () => console.log(`Main Server Running : ${port}`));
})
.catch((err) => console.log("ERROR STARTING SERVERS", err));

