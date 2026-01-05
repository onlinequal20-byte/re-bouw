# ⚡ Quick Start - Deploy to GitHub & Vercel

## 🎯 About Zoho API Console

**CLOSE THE ZOHO API CONSOLE TAB** - You don't need it! ✅

The system uses **SMTP authentication** (simpler), not OAuth API.

You only need:
- ✅ Zoho email address
- ✅ Zoho password (or App-Specific Password)

Configure these in: **Dashboard → Instellingen → Zoho Mail**

---

## 🚀 Deploy in 3 Steps (15 Minutes Total)

### Step 1: Create GitHub Repository (2 minutes)

1. Open https://github.com/new
2. Repository name: **`amsbouwers-dashboard`**
3. Description: `Professional Invoice & Quotation System for AMS Bouwers`
4. Choose **Private** (recommended)
5. DON'T initialize with README
6. Click **"Create repository"**
7. **Copy the repository URL** (e.g., `https://github.com/yourusername/amsbouwers-dashboard.git`)

---

### Step 2: Push Code to GitHub (3 minutes)

**Option A: Use the automated script**
```bash
cd "/Users/farazsharifi/amsbouwer dashboard "
./deploy.sh
```

**Option B: Manual commands**
```bash
cd "/Users/farazsharifi/amsbouwer dashboard "

# Initialize and commit
git init
git add .
git commit -m "Initial commit - AMS Bouwers Dashboard"

# Add your repository (REPLACE WITH YOUR URL!)
git remote add origin https://github.com/YOUR_USERNAME/amsbouwers-dashboard.git

# Push
git branch -M main
git push -u origin main
```

**✅ Verify:** Go to GitHub and see your code!

---

### Step 3: Deploy to Vercel (10 minutes)

#### 3.1: Setup Database
**Recommended: Neon.tech (Free)**
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project: `amsbouwers-db`
4. **Copy Connection String** (starts with `postgresql://`)

#### 3.2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New"** → **"Project"**
4. Find **`amsbouwers-dashboard`** in list
5. Click **"Import"**

#### 3.3: Add Environment Variables
Click **"Environment Variables"** and add these 3:

```
DATABASE_URL
postgresql://your-connection-string-from-neon

NEXTAUTH_URL  
https://your-project.vercel.app

NEXTAUTH_SECRET
[Run: openssl rand -base64 32]
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### 3.4: Configure Build
Under **"Build & Development Settings"**:
- Install Command: `npm install --legacy-peer-deps`
- Build Command: (leave default)
- Framework: Next.js (auto-detected)

#### 3.5: Deploy!
Click **"Deploy"** and wait 2-3 minutes ⏱️

---

## ✅ Post-Deployment Setup (5 minutes)

### Initialize Database
After deployment succeeds:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link
vercel login
vercel link

# Pull environment
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
npx prisma db seed
```

Or use Vercel dashboard to run these commands.

---

### Configure Zoho Email

1. Open your deployed app: `https://your-project.vercel.app`
2. Login: `nader@amsbouwers.nl` / `Sharifi_1967`
3. Go to **Instellingen** → **Zoho Mail** tab
4. Enter:
   - **Zoho Email:** your@zohomail.com
   - **Zoho Password:** your password or app-specific password
5. Click **"Instellingen Opslaan"**

**Test it:**
- Create an offerte
- Click "Verstuur Email"
- Email sent! ✅

---

## 🎉 You're Live!

Your app is now:
- ✅ Live on the internet
- ✅ SSL secured (HTTPS)
- ✅ Auto-deploying from GitHub
- ✅ Running on global CDN
- ✅ Production ready

**Your URLs:**
- **App:** https://your-project.vercel.app
- **GitHub:** https://github.com/your-username/amsbouwers-dashboard
- **Vercel Dashboard:** https://vercel.com/your-username/amsbouwers-dashboard

---

## 🔄 Future Updates

To update your app:
```bash
# Make changes to code
# ...

# Commit and push
git add .
git commit -m "Add new feature"
git push
```

**Vercel automatically deploys!** No manual work needed! 🚀

---

## 📱 Quick Access

Save these bookmarks:
1. **Your App:** https://your-project.vercel.app
2. **Vercel Dashboard:** https://vercel.com/dashboard
3. **GitHub Repo:** https://github.com/your-username/amsbouwers-dashboard
4. **Database (Neon):** https://console.neon.tech

---

## 🆘 Troubleshooting

**Build fails on Vercel?**
- Check all 3 environment variables are set
- Verify DATABASE_URL is correct PostgreSQL URL
- Make sure install command has `--legacy-peer-deps`

**Database errors?**
- Run `npx prisma migrate deploy`
- Verify connection string
- Check database is accessible from internet

**Can't login?**
- Default: nader@amsbouwers.nl / Sharifi_1967
- Make sure seed ran successfully
- Check database has User table with data

**Email not sending?**
- Add Zoho credentials in Settings
- Use app-specific password (more secure)
- Check SMTP is enabled in Zoho

---

## 📊 What You Have Now

### ✅ Features Working:
- Professional dashboard with statistics
- Client management (full CRUD)
- Create quotations with item picker
- Create invoices with payment tracking
- Download PDFs (Dutch format)
- Send emails via Zoho
- Mobile responsive
- Secure authentication
- Auto-numbering system
- Settings management

### ✅ Demo Data Included:
- 10 realistic Dutch clients
- 30 price list items
- 5 sample quotations
- 3 sample invoices
- Company settings pre-configured

### ✅ Production Ready:
- Deployed on Vercel
- PostgreSQL database
- SSL/HTTPS enabled
- Auto-scaling
- Global CDN
- Zero downtime deploys

---

## 🎓 Learn More

- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Project README:** See README.md
- **Deployment Guide:** See DEPLOYMENT.md
- **Zoho Setup:** See ZOHO_MAIL_SETUP.md

---

## 💡 Pro Tips

1. **Custom Domain:** Add in Vercel → Settings → Domains
2. **Team Access:** Vercel → Settings → Team → Invite members
3. **Analytics:** Enable in Vercel dashboard (free)
4. **Backups:** Neon auto-backs up your database
5. **Monitoring:** Check Vercel → Functions → Logs

---

## ✨ Next Steps

After deploying:
- [ ] Change admin password
- [ ] Add real company logo
- [ ] Configure Zoho email
- [ ] Test email sending
- [ ] Create real clients
- [ ] Remove demo data
- [ ] Share with team
- [ ] Set up custom domain (optional)

---

**🎉 Congratulations!** You now have a professional, production-ready contractor management system running on the cloud!

**Need help?** All documentation is in the repository:
- README.md - Full feature guide
- DEPLOYMENT.md - Detailed deployment steps
- ZOHO_MAIL_SETUP.md - Email configuration
- GITHUB_SETUP.md - Git workflow guide

