const nodemailer = require('nodemailer');

/**
 * Component 1B: Multi-Factor Authentication - Email OTP Service
 */

class EmailService {
  /**
   * Create transporter on-demand (not in constructor)
   * This prevents connection timeout issues
   */
  createTransporter() {
    const port = parseInt(process.env.EMAIL_PORT) || 587;
    const isSecure = port === 465; // true for port 465, false for 587

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: port,
      secure: isSecure, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
        minVersion: 'TLSv1.2',
        ciphers: 'SSLv3' // More compatible with Gmail
      },
      connectionTimeout: 30000, // 30 seconds (increased for cloud platforms)
      greetingTimeout: 30000,
      socketTimeout: 30000,
      pool: true, // Use pooled connections
      maxConnections: 5,
      logger: false, // Disable logging
      debug: false // Disable debug output
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
   * @param {string} purpose - Purpose of OTP (login, register, or finalize)
   */
  async sendOTP(email, otp, fullName, purpose = 'verification') {
    // DEVELOPMENT MODE: Bypass email sending if EMAIL_BYPASS_MODE is set
    if (process.env.EMAIL_BYPASS_MODE === 'true') {
      console.log('\n╔════════════════════════════════════════════════════╗');
      console.log('║  📧 EMAIL BYPASS MODE - OTP NOT SENT VIA EMAIL    ║');
      console.log('╚════════════════════════════════════════════════════╝');
      console.log(`\n🎯 OTP for ${purpose}:`);
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${fullName}`);
      console.log(`   OTP CODE: ${otp}`);
      console.log(`   Valid for: 5 minutes\n`);
      console.log('💡 Use this OTP in your frontend to test!\n');
      return true; // Pretend email was sent successfully
    }

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email service not configured. Please configure EMAIL_USER and EMAIL_PASS in .env file OR set EMAIL_BYPASS_MODE=true for development');
    }

    const purposes = {
      login: {
        subject: '🔐 Login Verification - Toxicology Portal',
        title: 'Login Verification',
        message: 'You have initiated a login. To complete the authentication process, please use the following One-Time Password (OTP):'
      },
      register: {
        subject: '🎉 Welcome - Account Verification',
        title: 'Account Registration',
        message: 'Welcome to the Toxicology Portal! To complete your registration, please verify your email using the following One-Time Password (OTP):'
      },
      finalize: {
        subject: '🔒 Report Approval - Toxicology Portal',
        title: 'Report Finalization',
        message: 'You have initiated the Report Finalization process. To complete the digital signature and approve this forensic report, please use the following One-Time Password (OTP):'
      }
    };

    // Default to 'finalize' if purpose not recognized
    const config = purposes[purpose] || purposes.finalize;

    const mailOptions = {
      from: `"Toxicology Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: config.subject,
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
              <h1>🔬 ${config.title}</h1>
              <p>Multi-Factor Authentication Required</p>
            </div>
            <div class="content">
              <p>Dear <strong>${fullName}</strong>,</p>
              
              <p>${config.message}</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Valid for 5 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>This OTP is for ${purpose} verification</li>
                  <li>Never share this code with anyone</li>
                  <li>It will expire in 5 minutes</li>
                  <li>If you did not request this, contact IT immediately</li>
                </ul>
              </div>
              
              <p>This is part of our <strong>Multi-Factor Authentication</strong> protocol to ensure account security.</p>
              
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
      // Create fresh transporter for each email
      const transporter = this.createTransporter();

      // Verify connection first (with timeout)
      console.log('📧 Connecting to email server...');
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email connection timeout')), 10000)
        )
      ]);
      console.log('✅ Email server connected');

      // Send email with increased timeout
      console.log(`📤 Sending OTP to ${email}...`);
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email send timeout - Gmail may be slow')), 30000)
        )
      ]);

      console.log(`✅ OTP sent successfully to ${email} for ${purpose}`);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      console.error('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
      console.error('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET');
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
