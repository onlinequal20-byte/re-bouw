# 📧 Email Sending Fix - Zoho Mail Configuration

## 🔍 Problem Identified

The email sending functionality for invoices and quotations is not working because:

1. **Zoho Mail credentials are configured but may be incorrect**
   - Current Zoho Email: `info@amsbouwers.nl`
   - Current Password: `Sharifi_1964`
   
2. **Possible issues:**
   - The email address might not be the correct Zoho account
   - The password might be incorrect or expired
   - Zoho might require an App-Specific Password instead of the regular password
   - "Less secure app access" might be disabled in Zoho

## ✅ Solution - How to Fix Email Sending

### Option 1: Update Credentials via Settings Page (Recommended)

1. **Go to Settings Page:**
   - Navigate to: http://localhost:3000/instellingen
   - Click on the "Zoho Mail" tab

2. **Update Zoho Email:**
   - Change from `info@amsbouwers.nl` to `nader@amsbouwers.nl` (if that's your actual Zoho account)
   - Or use whichever email address has an active Zoho Mail account

3. **Update Zoho Password:**
   - Enter your correct Zoho Mail password
   - Or create and use an App-Specific Password (more secure - see below)

4. **Click "Instellingen Opslaan"** (Save Settings)

### Option 2: Create Zoho App-Specific Password (More Secure)

If you're using 2FA or want better security:

1. **Log in to Zoho Mail:**
   - Go to: https://accounts.zoho.eu/home
   - Log in with your Zoho account

2. **Navigate to Security Settings:**
   - Click on your profile → Account Settings
   - Go to "Security" section
   - Find "App Passwords" or "Application-Specific Passwords"

3. **Generate New App Password:**
   - Click "Generate New Password"
   - Name it: "AMS Bouwers Dashboard"
   - Copy the generated password (you won't see it again!)

4. **Update in Dashboard:**
   - Go back to your dashboard settings
   - Paste the app password in the "Zoho Wachtwoord" field
   - Save settings

### Option 3: Enable Less Secure App Access

If you want to use your regular password:

1. **Go to Zoho Security Settings:**
   - https://accounts.zoho.eu/home#security

2. **Enable "Allow less secure apps":**
   - Find this option in security settings
   - Toggle it ON
   - Confirm the change

3. **Update Dashboard:**
   - Make sure your email and password are correct in the settings

## 🧪 Testing Email Sending

After configuring the credentials:

### Test with an Offerte (Quotation):

1. **Go to Offertes page:**
   - http://localhost:3000/offertes

2. **Click on any offerte** (e.g., OFF-2026-002)

3. **Click the "Email Versturen" button**

4. **Check for success:**
   - You should see a success toast notification
   - The email should be sent to the client
   - You'll receive a BCC copy at your company email

### Test with a Factuur (Invoice):

1. **Go to Facturen page:**
   - http://localhost:3000/facturen

2. **Click on any factuur** (e.g., FACT-2026-001)

3. **Click the "Email Versturen" button**

4. **Verify email was sent**

## 🔧 Current Configuration

Based on the database, here's what's currently set:

```
Zoho Email: info@amsbouwers.nl
Zoho Password: Sharifi_1964
Company Email: info@amsbouwers.nl
SMTP Server: smtp.zoho.eu
SMTP Port: 465 (SSL)
```

## ⚠️ Common Issues & Solutions

### Issue 1: "Zoho Mail credentials not configured"
**Solution:** Make sure both `zoho_email` and `zoho_password` are filled in the settings page.

### Issue 2: "Authentication failed"
**Solutions:**
- Verify the email address is correct
- Verify the password is correct
- Try using an App-Specific Password instead
- Enable "Less secure app access" in Zoho

### Issue 3: "Connection timeout"
**Solutions:**
- Check your internet connection
- Verify Zoho Mail is not blocked by firewall
- Try using `smtp.zoho.com` instead of `smtp.zoho.eu`

### Issue 4: "Klant heeft geen emailadres"
**Solution:** The client doesn't have an email address. Add one:
- Go to Klanten (Clients)
- Edit the client
- Add their email address
- Save

## 📝 What Gets Sent

When you send an email for an offerte or factuur:

### Attachments:
1. **PDF of the offerte/factuur** - Generated automatically
2. **Algemene Voorwaarden** - Terms and conditions (text file)

### Email Content:
- Professional Dutch email template
- Project details
- Amount and due date
- Digital signature link
- Company contact information

### BCC:
- A copy is automatically sent to your company email (`info@amsbouwers.nl`)

## 🔐 Security Best Practices

1. **Use App-Specific Passwords** instead of your main Zoho password
2. **Enable 2FA** on your Zoho account
3. **Regularly rotate** app passwords
4. **Don't share** your Zoho credentials
5. **Monitor** the Email page to see all sent emails

## 📊 Checking Sent Emails

To see all emails that have been sent:

1. Go to: http://localhost:3000/email
2. You'll see a list of all sent emails with:
   - Type (Offerte or Factuur)
   - Document number
   - Recipient
   - Subject
   - Status
   - Sent date

## 🚀 Quick Fix Script

If you want to quickly update the credentials via command line:

```bash
cd "/Users/farazsharifi/amsbouwer dashboard "

cat > update_zoho.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Zoho email
  await prisma.settings.upsert({
    where: { key: 'zoho_email' },
    update: { value: 'nader@amsbouwers.nl' },
    create: { key: 'zoho_email', value: 'nader@amsbouwers.nl' }
  });
  
  // Update Zoho password
  await prisma.settings.upsert({
    where: { key: 'zoho_password' },
    update: { value: 'YOUR_ACTUAL_PASSWORD_HERE' },
    create: { key: 'zoho_password', value: 'YOUR_ACTUAL_PASSWORD_HERE' }
  });
  
  console.log('✅ Zoho credentials updated!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
EOF

node update_zoho.js
rm update_zoho.js
```

**Remember to replace `YOUR_ACTUAL_PASSWORD_HERE` with your real password!**

## 📞 Need Help?

If emails still aren't sending after following these steps:

1. **Check the terminal/console logs** for error messages
2. **Verify Zoho account is active** and not suspended
3. **Test Zoho login** at https://mail.zoho.eu
4. **Check spam folder** - emails might be going there
5. **Verify client email addresses** are correct

## ✅ Verification Checklist

- [ ] Zoho email address is correct
- [ ] Zoho password is correct (or app password created)
- [ ] Settings saved in dashboard
- [ ] Client has an email address
- [ ] Test email sent successfully
- [ ] Email received by client
- [ ] BCC copy received at company email
- [ ] Email logged in Email page

---

**Last Updated:** January 6, 2026  
**Status:** Configuration Required  
**Next Action:** Update Zoho credentials in Settings page

