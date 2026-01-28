const nodemailer = require('nodemailer');

/**
 * Component 1B: Multi-Factor Authentication - Email OTP Service
 */

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    /**
     * Generate 6-digit OTP
     * @returns {string} 6-digit OTP code
     */
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Send OTP via email
     * @param {string} email - Recipient email
     * @param {string} otp - OTP code
     * @param {string} fullName - User's full name
     */
    async sendOTP(email, otp, fullName) {
        const mailOptions = {
            from: `"Toxicology Portal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔒 Report Approval OTP - Toxicology Portal',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔬 Toxicology Report Approval</h1>
              <p>Multi-Factor Authentication Required</p>
            </div>
            <div class="content">
              <p>Dear <strong>${fullName}</strong>,</p>
              
              <p>You have initiated the <strong>Report Finalization</strong> process. To complete the digital signature and approve this forensic report, please use the following One-Time Password (OTP):</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Valid for 5 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>This OTP is required to digitally sign the toxicology report</li>
                  <li>Once signed, the report becomes tamper-proof evidence</li>
                  <li>Never share this code with anyone</li>
                  <li>If you did not initiate this action, contact IT immediately</li>
                </ul>
              </div>
              
              <p>This is part of our <strong>Chain of Custody</strong> protocol to ensure the integrity of forensic evidence.</p>
              
              <div class="footer">
                <p>This is an automated message from the Secure Crime Lab Toxicology Portal</p>
                <p>© ${new Date().getFullYear()} Crime Lab Security System</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ OTP sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            throw new Error('Failed to send OTP email');
        }
    }
}

module.exports = new EmailService();
