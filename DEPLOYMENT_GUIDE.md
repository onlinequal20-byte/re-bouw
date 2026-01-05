# 🚀 Vercel Deployment Guide - PostgreSQL Setup

## Current Status

✅ **Code pushed to GitHub** - Commit: `f8cd534`  
✅ **Prisma schema updated** - Now using PostgreSQL  
⏳ **Deployment failed** - Needs PostgreSQL database setup  
✅ **Production site still working** - Using previous deployment with SQLite

## Why the Deployment Failed

The latest deployment failed because:
1. We updated the Prisma schema to use PostgreSQL
2. Vercel environment variables still point to SQLite (`file:./prod.db`)
3. PostgreSQL database hasn't been created yet

## 📋 Step-by-Step Setup Instructions

### Step 1: Create Vercel Postgres Database

1. **Go to your Vercel Dashboard:**
   ```
   https://vercel.com/farazs-projects-888371ca/amsbouwers-dashboard
   ```

2. **Navigate to Storage tab:**
   - Click on the "Storage" tab at the top
   - Click "Create Database"

3. **Select Postgres:**
   - Choose "Postgres" from the options
   - Select region: **Europe (Frankfurt)** or **Europe (Amsterdam)** (closest to Netherlands)
   - Click "Create"

4. **Wait for database creation** (takes ~30 seconds)

### Step 2: Connect Database to Project

Vercel will automatically:
- ✅ Add `DATABASE_URL` environment variable
- ✅ Add `POSTGRES_URL` environment variable
- ✅ Add `POSTGRES_PRISMA_URL` environment variable
- ✅ Add `POSTGRES_URL_NON_POOLING` environment variable

**Important:** Make sure these are added to the "Production" environment.

### Step 3: Update Environment Variables

You need to ensure these environment variables are set in Vercel:

1. Go to **Settings** → **Environment Variables**

2. **Verify these exist:**
   - `DATABASE_URL` - Should be set by Vercel Postgres
   - `DIRECT_URL` - Add this manually, use the `POSTGRES_URL_NON_POOLING` value
   - `NEXTAUTH_URL` - Should be `https://amsbouwers-dashboard.vercel.app`
   - `NEXTAUTH_SECRET` - Should already exist: `hsQZqT1uaoTVl2qNDg0xYXeW8+rj9D1dEBPkqY8fWv4=`

3. **Add DIRECT_URL:**
   - Click "Add New"
   - Key: `DIRECT_URL`
   - Value: Copy the value from `POSTGRES_URL_NON_POOLING`
   - Environment: Production, Preview, Development
   - Click "Save"

4. **Optional - Zoho Mail (for email sending):**
   - `ZOHO_SMTP_HOST` = `smtp.zoho.eu`
   - `ZOHO_SMTP_PORT` = `465`
   - `ZOHO_SMTP_USER` = `nader@amsbouwers.nl`
   - `ZOHO_SMTP_PASSWORD` = Your Zoho app password
   - `ZOHO_FROM_EMAIL` = `nader@amsbouwers.nl`
   - `ZOHO_FROM_NAME` = `AMS Bouwers B.V.`

### Step 4: Run Database Migration

After the database is created and connected, you need to run migrations:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Pull environment variables
vercel env pull

# Run migration
npx prisma migrate deploy
```

**Option B: Using Vercel Dashboard**

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click "Redeploy"
4. This will trigger a new build with the correct database

**Option C: Manual SQL (Advanced)**

1. Go to **Storage** → Your Postgres database
2. Click "Query" tab
3. Run the migration SQL manually (found in `prisma/migrations/`)

### Step 5: Seed the Database

After migration, you need to create the admin user:

```bash
# Using Vercel CLI
vercel env pull
npx prisma db seed
```

Or create the user manually through Prisma Studio or SQL:

```sql
INSERT INTO "User" (id, email, name, password, "createdAt", "updatedAt")
VALUES (
  'user_admin_001',
  'nader@amsbouwers.nl',
  'Nader Sharifi',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt to hash 'Sharifi_1967'
  NOW(),
  NOW()
);
```

### Step 6: Redeploy

After setting up the database and environment variables:

```bash
# Trigger a new deployment
vercel --prod
```

Or simply push a new commit to trigger auto-deployment:

```bash
git commit --allow-empty -m "Trigger deployment with PostgreSQL"
git push origin main
```

## 🔍 Verify Deployment

1. **Check deployment status:**
   ```bash
   vercel ls
   ```

2. **View logs:**
   ```bash
   vercel logs https://amsbouwers-dashboard.vercel.app
   ```

3. **Test the site:**
   - Visit: https://amsbouwers-dashboard.vercel.app/login
   - Login with: `nader@amsbouwers.nl` / `Sharifi_1967`

## 🐛 Troubleshooting

### Deployment still failing?

1. **Check environment variables:**
   ```bash
   vercel env ls
   ```

2. **Check build logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on the failed deployment
   - Check the "Build Logs" tab

3. **Common issues:**
   - ❌ `DATABASE_URL` not set → Add in Vercel settings
   - ❌ `DIRECT_URL` not set → Add manually
   - ❌ Migration failed → Run `npx prisma migrate deploy` manually
   - ❌ No admin user → Run seed script or create manually

### Database connection issues?

1. **Verify connection string:**
   - Should start with `postgres://` or `postgresql://`
   - Should include `?pgbouncer=true` for pooling
   - Should have `sslmode=require`

2. **Test connection locally:**
   ```bash
   # Pull production env vars
   vercel env pull .env.production

   # Test connection
   npx prisma db pull --schema=./prisma/schema.prisma
   ```

## 📊 What Happens After Setup

Once PostgreSQL is set up:

✅ **Persistent data** - Data survives deployments  
✅ **Shared across functions** - All serverless functions access same DB  
✅ **Production-ready** - Suitable for real business use  
✅ **Automatic backups** - Vercel handles backups  
✅ **Connection pooling** - Better performance  

## 🔄 Switching Between SQLite (Local) and PostgreSQL (Production)

For local development with SQLite, update your local `.env`:

```env
# Local development with SQLite
DATABASE_URL="file:./dev.db"
```

For production with PostgreSQL, Vercel handles this automatically.

## 📝 Next Steps After Deployment

1. ✅ Test login functionality
2. ✅ Create a few test clients
3. ✅ Generate a test quotation
4. ✅ Test PDF generation
5. ✅ Test email sending (if Zoho configured)
6. ✅ Test signature system
7. ✅ Verify all CRUD operations

## 🆘 Need Help?

If you encounter issues:
1. Check the build logs in Vercel Dashboard
2. Verify all environment variables are set
3. Ensure database migrations ran successfully
4. Test the connection with Prisma Studio

## 🎉 Success Checklist

- [ ] Vercel Postgres database created
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Admin user created/seeded
- [ ] Deployment successful (green checkmark)
- [ ] Can log in at production URL
- [ ] Dashboard loads with data
- [ ] All features working

---

**Production URL:** https://amsbouwers-dashboard.vercel.app  
**Vercel Dashboard:** https://vercel.com/farazs-projects-888371ca/amsbouwers-dashboard  
**GitHub Repo:** https://github.com/Farazs27/amsbouwers-dahsboardh

**Login Credentials:**
- Email: `nader@amsbouwers.nl`
- Password: `Sharifi_1967`

