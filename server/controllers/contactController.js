require("dotenv").config();
const { sendEmail } = require("../lib/mailer");

const escapeHtml = (s = "") =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, phone, email, interest, message } = req.body;

    const to = process.env.MAIL_TO || "info@flyhighpehowa.in";
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
    const text = [
      "New Website Enquiry",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Interest: ${interest}`,
      `Message: ${message || "-"}`,
      "",
      "Sent from Fly High Consultancy website contact form.",
    ].join("\n");

    // Shared Brevo + SMTP transport (server/lib/mailer.js). No email config here.
    const { delivered, transport, error } = await sendEmail({
      to,
      subject,
      html,
      text,
      replyTo: { email, name },
    });

    if (!delivered) {
      console.error("[contact] email not delivered:", error?.message || "unknown error");
      return res.status(500).json({
        success: false,
        message: "Failed to send your enquiry. Please try again or contact us directly.",
      });
    }

    console.log(`[contact] enquiry emailed via ${transport}`);
    return res.status(200).json({
      success: true,
      message: "Thank you! Your enquiry has been sent successfully. We will contact you shortly.",
    });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send your enquiry. Please try again or contact us directly.",
    });
  }
};