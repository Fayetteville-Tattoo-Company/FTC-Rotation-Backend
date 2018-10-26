const nodemailer = require('nodemailer');

const email =  (auth, to, subject, html, text, req, next) => {
   //sender email
    const transporter = nodemailer.createTransport({
      service: auth.service,
      auth: {
        user: auth.user, // SENDER USER
        pass: auth.pass // SENDER PASS
      }
    });

    // setup email data with unicode symbols
    const mailOptions = {
      from: auth.user, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html // html body
    };

    // send mail with defined transport object

  transporter.sendMail(mailOptions, (error, info) => {
    error ? req.sent  = {status:'FAILED', message:error.message}: req.sent = 'SUCCESS';
    console.log(error);
    return next();
  });
};

  module.exports = {
    email
  };
