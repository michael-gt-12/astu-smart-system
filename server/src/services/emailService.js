const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const complaintSubmittedTemplate = (complaint, userName) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">📋 Complaint Submitted</h1>
    </div>
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 16px;">Hello <strong>${userName}</strong>,</p>
      <p style="color: #555;">Your complaint has been successfully submitted. Here are the details:</p>
      <div style="background: #f8f9fc; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;"><strong>Title:</strong> ${complaint.title}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background: #e3f2fd; color: #1565c0; padding: 3px 10px; border-radius: 12px; font-size: 13px;">Open</span></p>
      </div>
      <p style="color: #555;">We will review your complaint and get back to you shortly.</p>
      <p style="color: #888; font-size: 13px; margin-top: 30px;">— ASTU Smart Complaint System</p>
    </div>
  </div>
</body>
</html>
`;

const statusUpdateTemplate = (complaint, userName, newStatus, remarks) => {
  const statusColors = {
    'Open': { bg: '#e3f2fd', color: '#1565c0' },
    'In Progress': { bg: '#fff3e0', color: '#e65100' },
    'Pending Student Verification': { bg: '#ede7f6', color: '#5e35b1' },
    'Resolved': { bg: '#e8f5e9', color: '#2e7d32' },
  };
  const sc = statusColors[newStatus] || statusColors['Open'];

  const instruction = newStatus === 'Pending Student Verification'
    ? '<p style="color: #555; font-weight: bold; margin-top: 15px;">Action Required: Please log in to your account and confirm if the issue is resolved to your satisfaction.</p>'
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">🔄 Status Update</h1>
    </div>
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 16px;">Hello <strong>${userName}</strong>,</p>
      <p style="color: #555;">Your complaint status has been updated:</p>
      <div style="background: #f8f9fc; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 5px 0;"><strong>Title:</strong> ${complaint.title}</p>
        <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="background: ${sc.bg}; color: ${sc.color}; padding: 3px 10px; border-radius: 12px; font-size: 13px;">${newStatus}</span></p>
        ${remarks ? `<p style="margin: 5px 0;"><strong>Remarks:</strong> ${remarks}</p>` : ''}
      </div>
      ${instruction}
      <p style="color: #888; font-size: 13px; margin-top: 30px;">— ASTU Smart Complaint System</p>
    </div>
  </div>
</body>
</html>
`;
};

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
      console.log(`[Email] Skipping email to ${to} (SMTP not configured)`);
      return;
    }
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"ASTU Smart System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error.message);
  }
};

const sendComplaintSubmittedEmail = async (email, complaint, userName) => {
  const html = complaintSubmittedTemplate(complaint, userName);
  await sendEmail(email, 'Complaint Submitted Successfully', html);
};

const sendStatusUpdateEmail = async (email, complaint, userName, newStatus, remarks) => {
  const html = statusUpdateTemplate(complaint, userName, newStatus, remarks);
  await sendEmail(email, `Complaint Status Updated: ${newStatus}`, html);
};

module.exports = {
  sendComplaintSubmittedEmail,
  sendStatusUpdateEmail,
};
