import nodemailer from "nodemailer";

const isSMTPConfigured = 
  process.env.SMTP_HOST && 
  process.env.SMTP_PORT && 
  process.env.SMTP_USER && 
  process.env.SMTP_PASSWORD;

let transporter = null;

if (isSMTPConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
} else {
  console.warn("SMTP/Email configurations are missing. Emails will be logged to the console.");
}

export const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || "noreply@medishop.com";
  
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: text || html.replace(/<[^>]*>/g, ""),
        html,
      });
      console.log(`Email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`Email send failed: ${error.message}`);
      throw error;
    }
  } else {
    console.log("============= EMAIL SEND MOCK =============");
    console.log(`From:    ${from}`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${text || html}`);
    console.log("===========================================");
    return { mockSent: true };
  }
};
