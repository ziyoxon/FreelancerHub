const nodemailer = require("nodemailer");
const config = require("config");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: config.get("smtp_host"),
      port: config.get("smtp_port"),
      secure: false,
      auth: {
        user: config.get("smtp_user"),
        pass: config.get("smtp_password"),
      },
    });
  }
  async sendActivationMail(toEmail, link) {
    await this.transporter.sendMail({
      from: config.get("smtp_user"),
      to: toEmail,
      subject: "FreelanceHub akkauntini faollashtirish",
      //   text: `Please click on the following link to activate your account: ${link}`,
      text: "",
      html: `
    <div>
        <h1 style="color: blue;">Akkauntni faollashtirish uchun quyidagi linkni bosing</h1>
        <a style="color: green;" href="${link}">FAOLLASHTIRING</a>
    </div>
    `,
    });
  }
}

module.exports = new MailService();
