const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send invitation email to new staff member
 */
async function sendInvitationEmail(email, restaurantName, invitationLink, roleName) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Invitation to join ${restaurantName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9fafb; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have been invited to join <strong>${restaurantName}</strong> as a <strong>${roleName || 'staff member'}</strong>.</p>
            <p>To accept this invitation and create your account, please click the button below:</p>
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Accept Invitation</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${invitationLink}</p>
            <p><strong>Note:</strong> This invitation will expire in 7 days.</p>
          </div>
          <div class="footer">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} ${restaurantName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendInvitationEmail,
};
