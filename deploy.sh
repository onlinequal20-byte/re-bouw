#!/bin/bash

# 🚀 AMS Bouwers Dashboard - GitHub & Vercel Deployment Script

echo "🎉 AMS Bouwers Dashboard - Deployment Setup"
echo "============================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if origin exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists"
    echo "Current origin: $(git remote get-url origin)"
    read -p "Do you want to change it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your GitHub repository URL: " REPO_URL
        git remote set-url origin "$REPO_URL"
        echo "✅ Remote URL updated"
    fi
else
    echo "📝 Setting up GitHub remote..."
    read -p "Enter your GitHub repository URL (https://github.com/YOUR_USERNAME/amsbouwers-dashboard.git): " REPO_URL
    git remote add origin "$REPO_URL"
    echo "✅ Remote added"
fi

echo ""
echo "📋 Staging all files..."
git add .

echo ""
echo "💾 Creating commit..."
git commit -m "🎉 Initial commit - AMS Bouwers Dashboard v1.0

Features:
- Complete authentication system with NextAuth v5
- Client management (full CRUD)
- Quotation creation with item management from price list
- Invoice creation with payment tracking
- PDF generation for professional Dutch invoices
- Email sending via Zoho Mail SMTP
- Mobile responsive design
- Professional UI with shadcn/ui components
- PostgreSQL/SQLite database support
- 10 demo clients with realistic Amsterdam addresses
- 30 price list items across 9 categories
- Full Dutch language support
- Auto-numbering system (OFF-YYYY-XXX, FACT-YYYY-XXX)
- Settings page for company info and Zoho configuration
- Dashboard with statistics and charts
- Comprehensive documentation

Tech Stack:
- Next.js 15 with App Router
- TypeScript
- Prisma ORM
- NextAuth.js v5
- Tailwind CSS + shadcn/ui
- React PDF Renderer
- Nodemailer + Zoho SMTP
- React Hook Form + Zod validation"

echo ""
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📱 Next Steps:"
    echo "1. Go to https://github.com and verify your code is there"
    echo "2. Go to https://vercel.com to deploy"
    echo "3. Click 'Add New' → 'Project'"
    echo "4. Select your repository"
    echo "5. Add environment variables (see DEPLOYMENT.md)"
    echo "6. Click 'Deploy'"
    echo ""
    echo "📖 Full deployment guide: See DEPLOYMENT.md"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please check the error above."
    echo ""
    echo "Common issues:"
    echo "1. Make sure you created the repository on GitHub first"
    echo "2. Check your repository URL is correct"
    echo "3. Make sure you have push access to the repository"
    echo ""
fi

