require("dotenv").config();
const nodemailer = require("nodemailer");

const isConfiguredSmtp = () => {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    !String(process.env.SMTP_USER).includes("your_email") &&
    !String(process.env.SMTP_PASS).includes("your_app_password")
  );
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, phone, email, interest, message } = req.body;

    const to = process.env.MAIL_TO || "info@flyhighpehowa.in";
    const fromEmail =
      process.env.MAIL_FROM || process.env.SMTP_USER || "info@flyhighpehowa.in";
    const subject = `New Enquiry: ${interest} - ${name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #0B1F3A;">
        <h2 style="color:#38BDF8;">New Website Enquiry</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding:8px; font-weight:bold;">Name</td><td style="padding:8px;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Phone</td><td style="padding:8px;">${escapeHtml(phone)}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Email</td><td style="padding:8px;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Interest</td><td style="padding:8px;">${escapeHtml(interest)}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Message</td><td style="padding:8px;">${escapeHtml(message) || "-"}</td></tr>
        </table>
        <p style="margin-top:20px; font-size:12px; color:#666;">Sent from Fly High Consultancy website contact form.</p>
      </div>
    `;

    // Brevo (Sendinblue) API
    if (process.env.BREVO_API_KEY) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "Fly High Consultancy Website", email: fromEmail },
          to: [{ email: to }],
          replyTo: { email },
          subject,
          htmlContent: html,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Brevo API error:", data);
        return res.status(500).json({
          success: false,
          message: "Failed to send your enquiry. Please try again or contact us directly.",
        });
      }
      console.log("Brevo email sent:", data);
      return res.status(200).json({
        success: true,
        message: "Thank you! Your enquiry has been sent successfully. We will contact you shortly.",
      });
    }

    // SMTP fallback
    if (isConfiguredSmtp()) {
      const transporter = createTransporter();
      const mailOptions = {
        from: `"Fly High Consultancy Website" <${process.env.SMTP_USER}>`,
        to,
        replyTo: email,
        subject,
        html,
      };
      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        success: true,
        message: "Thank you! Your enquiry has been sent successfully. We will contact you shortly.",
      });
    }

    // Dev mode
    console.log("Email not configured. Received contact submission:", req.body);
    return res.status(200).json({
      success: true,
      message:
        "Your enquiry has been received. We will contact you shortly. (Email not configured - dev mode)",
    });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send your enquiry. Please try again or contact us directly.",
    });
  }
};
