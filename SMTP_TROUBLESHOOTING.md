# 🔧 Gmail SMTP Configuration & Troubleshooting

## Current Configuration

I've updated your email settings to use **port 465 with SSL** instead of port 587 (STARTTLS).

### Updated `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465  ← Changed from 587
EMAIL_USER=forensic.lab.portal@gmail.com
EMAIL_PASS=ebuu zmvc ydnd egrd
```

**Port 465 (SSL)** often works better than port 587 (STARTTLS) in restrictive network environments.

---

## Why Email Might Timeout

### Common Causes:

1. **Firewall/Antivirus Blocking SMTP**
   - Windows Firewall may block outgoing SMTP
   - Antivirus (Avast, Norton, etc.) may block email ports

2. **ISP Blocking**
   - Some ISPs block ports 25, 465, and 587 to prevent spam
   - Common with residential internet

3. **Network Restrictions**
   - Corporate/University networks often block SMTP
   - VPN may interfere

4. **Gmail App Password Issues**
   - Password might be incorrect or expired
   - 2FA not enabled on Gmail account

---

## Solution 1: Try Port 465 (Current)

The server should auto-restart. Try registering/logging in again.

**Test**:
1. Go to `http://localhost:3000/register`
2. Enter your email
3. Submit form
4. Check if OTP email arrives

**Check backend terminal for**:
```
✅ OTP sent to your@email.com for register
```

OR

```
❌ Email sending failed: [error message]
```

---

## Solution 2: If Still Timing Out - Allow Firewall

### Windows Firewall:

1. Open **Windows Defender Firewall**
2. Click **Advanced Settings**
3. Click **Outbound Rules** → **New Rule**
4. Select **Port** → Next
5. Select **TCP** → Enter port: `465` → Next
6. Select **Allow the connection** → Next
7. Check all profiles → Next
8. Name: "Gmail SMTP 465" → Finish

**Repeat for port 587 as backup**.

---

## Solution 3: Test with Antivirus Disabled

Temporarily disable antivirus (Windows Defender, Norton, etc.) and test.

**If it works**: Add exception for Node.js or ports 465/587.

---

## Solution 4: Alternative SMTP Services

If Gmail continues to timeout, use an alternative service:

### Option A: Ethereal Email (Testing/Development)

Free fake SMTP for testing. Creates a test inbox you can view.

**Update `backend/utils/emailService.js`**:
```javascript
// At the top, add:
const nodemailer = require('nodemailer');

// Create test account (do this once)
async createTestTransporter() {
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
}
```

Then view emails at: https://ethereal.email/messages

### Option B: SendGrid (Free Tier)

1. Sign up at: https://sendgrid.com (free 100 emails/day)
2. Get API key
3. Update `.env`:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=465
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key_here
```

### Option C: Mailtrap (Development)

1. Sign up at: https://mailtrap.io (free for development)
2. Get SMTP credentials
3. Update `.env`:
```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASS=your_mailtrap_password
```

---

## Solution 5: Verify Gmail App Password

Your current password: `ebuu zmvc ydnd egrd`

**Verify it's correct**:

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to `forensic.lab.portal@gmail.com`
3. Check if existing app password exists
4. If not, create new one:
   - Select **App**: Mail
   - Select **Device**: Windows Computer
   - Click **Generate**
   - Copy the 16-character password (no spaces)
5. Update `.env` with new password

---

## Solution 6: Test Gmail SMTP Manually

Create a test file `backend/test-email.js`:

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Sending test email...');
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'Test Email',
            text: 'If you receive this, SMTP is working!'
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEmail();
```

**Run**:
```powershell
node backend/test-email.js
```

**If this works**: Issue is with the main app code  
**If this fails**: Issue is with network/credentials

---

## Solution 7: Use Your Personal Gmail

Instead of `forensic.lab.portal@gmail.com`, use your personal Gmail:

1. Enable 2FA on your personal Gmail
2. Generate app password
3. Update `.env`:
```env
EMAIL_USER=your.personal@gmail.com
EMAIL_PASS=your_new_app_password
```

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] Port 465 configured in `.env`
- [ ] Gmail App Password is correct (16 chars, no spaces)
- [ ] 2FA enabled on Gmail account
- [ ] Windows Firewall allows port 465
- [ ] Antivirus not blocking Node.js
- [ ] Not on restricted network (VPN, corporate)
- [ ] Server restarted after changes

---

## Expected Backend Terminal Output

### Success:
```
✅ MongoDB Connected Successfully
✅ OTP sent to user@example.com for register
```

### Timeout (Network Issue):
```
✅ MongoDB Connected Successfully
❌ Email sending failed: Timeout
OTP request error: Error: Failed to send OTP email: Timeout
```

### Auth Failed (Wrong Password):
```
✅ MongoDB Connected Successfully
❌ Email sending failed: Invalid login: 535-5.7.8 Username and Password not accepted
```

### Not Configured:
```
❌ OTP request error: Error: Email service not configured
```

---

## Recommended Next Steps

**1. Try Current Setup (Port 465)**:
   - Servers should auto-restart
   - Test registration
   - Check for success message

**2. If Still Fails - Check Firewall**:
   - Allow port 465 in Windows Firewall
   - Temporarily disable antivirus

**3. If Still Fails - Use Alternative**:
   - Try your personal Gmail
   - Or use SendGrid/Mailtrap for testing

**4. For Demo/Viva**:
   - You can use Mailtrap (shows emails in web UI)
   - Or use real Gmail if it works

---

## For Your Viva

If examiner asks about email issues:

**Good Answer**:
"During development, we encountered SMTP timeout issues due to network firewall restrictions. We implemented multiple solutions:

1. **Port Configuration**: Tested both port 587 (STARTTLS) and 465 (SSL)
2. **Timeout Handling**: Configured connection, greeting, and socket timeouts
3. **Error Handling**: Proper error messages if email fails
4. **Alternative Providers**: System supports any SMTP provider (Gmail, SendGrid, etc.)

For production deployment, we'd use a dedicated email service like SendGrid or AWS SES which are more reliable than Gmail SMTP."

---

Let me know which solution you'd like to try! 🚀
