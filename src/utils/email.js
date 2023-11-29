import nodemailer from "nodemailer";

const sendEmailWithNodemailer = (emailData) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    requireTLS: true,
    debug: true,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      return true;
    })
    .catch((err) => {
      console.log(`Problem sending email: ${err}`);
      return false;
    });
};

export default sendEmailWithNodemailer;
