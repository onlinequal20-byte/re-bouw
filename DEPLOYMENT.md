# 🚀 Deployment Guide - AMS Bouwers Dashboard

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works!)
- PostgreSQL database (I recommend Neon.tech - free tier)

---

## Step 1: Prepare Database (5 minutes)

### Option A: Neon.tech (Recommended - Free)
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project: "amsbouwers-db"
4. Copy the **Connection String**
5. Keep it for Step 3

### Option B: Supabase (Also Free)
1. Go to https://supabase.com
2. Create new project: "amsbouwers-db"
3. Go to Settings → Database
4. Copy **Connection Pooling** string (Transaction mode)
5. Keep it for Step 3

---

## Step 2: Push to GitHub

I've already prepared everything! Just run these commands:

```bash
cd "/Users/farazsharifi/amsbouwer dashboard "

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AMS Bouwers Dashboard v1.0"

# Create repository on GitHub and push
# (You'll need to create the repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/amsbouwers-dashboard.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel (5 minutes)

### 3.1: Import Project
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `amsbouwers-dashboard`
4. Click **"Import"**

### 3.2: Configure Environment Variables
Before deploying, add these environment variables:

Click **"Environment Variables"** and add:

**Required:**
```
DATABASE_URL = [Your PostgreSQL connection string from Step 1]
NEXTAUTH_URL = https://your-project-name.vercel.app
NEXTAUTH_SECRET = [Generate random string - see below]
```

**Generate NEXTAUTH_SECRET:**
Run this in terminal:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

### 3.3: Build Settings
Vercel will auto-detect Next.js. Make sure:
- **Framework Preset:** Next.js
- **Build Command:** Leave default
- **Install Command:** `npm install --legacy-peer-deps`

### 3.4: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your app will be live! 🎉

---

## Step 4: Setup Database

After first deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

Or use Vercel's dashboard:
1. Go to your project → Settings → Functions
2. Click **"Add a function"**
3. Run: `npx prisma migrate deploy && npx prisma db seed`

---

## Step 5: Configure Zoho (Optional)

Once deployed, go to your app:
1. Login with: nader@amsbouwers.nl / Sharifi_1967
2. Go to **Instellingen** → **Zoho Mail**
3. Add your Zoho credentials
4. Start sending emails!

---

## 🎯 Your App URLs

After deployment, you'll have:
- **Production:** https://amsbouwers-dashboard.vercel.app
- **Dashboard:** https://vercel.com/your-username/amsbouwers-dashboard

---

## 🔄 Future Updates

To update your app:
```bash
git add .
git commit -m "Update: describe your changes"
git push
```

Vercel will auto-deploy! 🚀

---

## 🔐 Change Admin Password

After first deployment, update the admin password:
1. Go to your database
2. Run:
```sql
UPDATE "User" 
SET password = [bcrypt hash of new password]
WHERE email = 'nader@amsbouwers.nl';
```

Or create a new admin user via the Prisma Studio.

---

## 📊 Monitor Your App

- **Analytics:** Vercel Dashboard → Analytics
- **Logs:** Vercel Dashboard → Functions → Logs
- **Database:** Use Prisma Studio or your database provider's dashboard

---

## ⚙️ Production Checklist

Before going live:
- [ ] Change admin password
- [ ] Add real company logo
- [ ] Configure Zoho Mail
- [ ] Test email sending
- [ ] Test PDF generation
- [ ] Create real clients
- [ ] Set up custom domain (optional)
- [ ] Enable SSL (automatic on Vercel)

---

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set
- Verify DATABASE_URL is correct
- Make sure `--legacy-peer-deps` is in install command

### Database Errors
- Run `npx prisma migrate deploy`
- Check connection string format
- Verify database is accessible

### PDF Generation Issues
- PDFs work automatically on Vercel
- No additional configuration needed

### Email Not Sending
- Verify Zoho credentials in Settings
- Check Zoho SMTP is enabled
- Try App-Specific Password

---

## 🎉 You're Live!

Your professional contractor management system is now:
- ✅ Running on global CDN
- ✅ Auto-scaling
- ✅ SSL secured
- ✅ Auto-deploying on git push
- ✅ Production ready

---

**Need help?** Check Vercel docs: https://vercel.com/docs

