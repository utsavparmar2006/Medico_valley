# One-Click Deployment Script for Medico Valley to AWS EC2
param (
    [string]$commitMessage = "Deploy update to AWS EC2"
)

Write-Host "=== 🚀 Step 1: Pushing code to GitHub ===" -ForegroundColor Cyan
git add .
git commit -m "$commitMessage"
git push origin main

Write-Host "`n=== ☁️ Step 2: Connecting to EC2 & Deploying Live ===" -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no -i "medico-valley-key.pem" ubuntu@43.204.100.94 "cd /var/www/delta-healthcare && git pull origin main && cd backend && npm run build && pm2 restart medico-valley-backend && cd ../frontend && npm run build && pm2 restart medico-valley-frontend && pm2 status"

Write-Host "`n=== 🎉 SUCCESS! Live website updated at http://43.204.100.94 ===" -ForegroundColor Green
