const nodemailer = require('nodemailer');

const email =  (auth, to, subject, html, text, req, next) => {
   //sender email
  const user = auth.user;
  const pass = auth.pass; //sender password
    const transporter = nodemailer.createTransport({
      service: auth.service,
      auth: {
          user, // SENDER USER
          pass // SENDER PASS
      },
      localAddress: process.env.SERVER
      
    });

    // setup email data with unicode symbols
    const mailOptions = {
        from: user, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html // html body
    };

    // send mail with defined transport object

  transporter.sendMail(mailOptions, (error, info) => {
    error ? req.sent  = 'FAILED' + error: req.sent = 'SUCCESS';
    console.log(error);
    return next();
  });
};

  module.exports = {
    email
  };
