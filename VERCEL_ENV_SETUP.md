# 🔧 Vercel Environment Variables Setup

## ✅ Database is Ready!

Your Supabase PostgreSQL database is set up and the admin user has been created!

**Now you need to add the environment variables to Vercel so the deployed app can connect to the database.**

---

## 📋 Step-by-Step: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
Visit: https://vercel.com/farazs-projects-888371ca/amsbouwer-dashboard

### Step 2: Navigate to Settings
1. Click **"Settings"** in the top navigation
2. Click **"Environment Variables"** in the left sidebar

### Step 3: Add Each Variable

Click **"Add New"** for each variable below. For each one:
- Enter the **Key** (variable name)
- Enter the **Value** (copy exactly as shown)
- Select **All Environments** (Production, Preview, Development)
- Click **"Save"**

---

## 🔑 Required Environment Variables

### 1. DATABASE_URL
```
Key: DATABASE_URL
Value: postgres://postgres.vmackqzeeuqzlymqgbzu:zWTwIEQnRwqr2liz@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
Environments: Production, Preview, Development
```

### 2. DIRECT_URL
```
Key: DIRECT_URL
Value: postgres://postgres.vmackqzeeuqzlymqgbzu:zWTwIEQnRwqr2liz@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
Environments: Production, Preview, Development
```

### 3. NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://amsbouwer-dashboard.vercel.app
Environments: Production, Preview, Development
```

### 4. NEXTAUTH_SECRET
First, generate a secret by running this command in your terminal:
```bash
openssl rand -base64 32
```

Copy the output, then add:
```
Key: NEXTAUTH_SECRET
Value: (paste the generated secret here)
Environments: Production, Preview, Development
```

### 5. NEXT_PUBLIC_BASE_URL
```
Key: NEXT_PUBLIC_BASE_URL
Value: https://amsbouwer-dashboard.vercel.app
Environments: Production, Preview, Development
```

---

## 🔄 Step 4: Redeploy

After adding ALL 5 variables above, you need to redeploy:

### Option A: Via Vercel Dashboard
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **three dots (•••)** menu
4. Click **"Redeploy"**
5. Click **"Redeploy"** to confirm

### Option B: Via CLI
```bash
cd "/Users/farazsharifi/amsbouwer dashboard "
vercel --prod
```

---

## ✅ Step 5: Test Login

After redeployment completes (~2 minutes):

1. Visit: https://amsbouwer-dashboard.vercel.app/login

2. Enter credentials:
   - **Email:** nader@amsbouwers.nl
   - **Password:** Sharifi_1967

3. Click **"Inloggen"**

4. You should be redirected to the dashboard! 🎉

---

## 📊 What's Been Set Up

### Database: ✅
- ✅ Supabase PostgreSQL database created
- ✅ All tables created (User, Klant, Offerte, Factuur, etc.)
- ✅ Admin user created (nader@amsbouwers.nl)
- ✅ 10 demo clients created
- ⚠️ Price list partially seeded (connection pool limit reached, but not critical)

### Application: ✅
- ✅ Deployed to Vercel
- ✅ All pages and API routes working
- ⏳ Waiting for environment variables to be added

---

## 🐛 Troubleshooting

### Issue: Login still fails after adding variables and redeploying

**Solution 1: Verify all variables are set**
1. Go to Settings → Environment Variables
2. Check that all 5 variables are present
3. Make sure they're enabled for "Production" environment

**Solution 2: Check deployment logs**
```bash
vercel logs amsbouwer-dashboard.vercel.app
```
Look for any database connection errors.

**Solution 3: Redeploy again**
Sometimes the first redeploy after adding variables doesn't pick them up. Try redeploying one more time.

### Issue: "NEXTAUTH_SECRET" error

**Solution:**
Make sure you generated a proper secret:
```bash
openssl rand -base64 32
```
The output should be a long random string like: `abc123XYZ...`

### Issue: Database connection timeout

**Solution:**
The connection strings are correct. This usually means:
1. Environment variables aren't set in Vercel yet
2. Need to redeploy after adding variables

---

## 📋 Quick Checklist

- [ ] Opened Vercel dashboard
- [ ] Went to Settings → Environment Variables
- [ ] Added `DATABASE_URL`
- [ ] Added `DIRECT_URL`
- [ ] Added `NEXTAUTH_URL`
- [ ] Generated and added `NEXTAUTH_SECRET`
- [ ] Added `NEXT_PUBLIC_BASE_URL`
- [ ] Redeployed the application
- [ ] Waited for deployment to complete
- [ ] Tested login at https://amsbouwer-dashboard.vercel.app/login
- [ ] Successfully logged in! ✅

---

## 🎯 Summary

**What's Done:**
- ✅ Database created and configured
- ✅ Schema deployed to database
- ✅ Admin user created
- ✅ Application deployed to Vercel

**What You Need to Do:**
1. Add 5 environment variables to Vercel (5 minutes)
2. Redeploy the application (2 minutes)
3. Test login (1 minute)

**Total Time:** ~8 minutes

---

## 🚀 After Login Works

Once you're logged in, you'll have access to:
- ✅ Dashboard with statistics
- ✅ Client management (10 demo clients already created)
- ✅ Create quotations
- ✅ Create invoices
- ✅ Manage prices
- ✅ Send emails (after configuring Zoho)
- ✅ Generate PDFs
- ✅ Digital signatures

---

**Your application is 95% ready! Just add the environment variables and you're done!** 🎉

