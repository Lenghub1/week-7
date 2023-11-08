import nodemailer from "nodemailer";

const sendEmailWithNodemailer = (req, res, emailData) => {
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
      return res.status(200).json({
        message: `Email has been send to your email. Follow the instruction to activate your account`,
      });
    })
    .catch((err) => `Problem sending email: ${err}`);
};

export default sendEmailWithNodemailer;
