# Deployment Script for Medico Valley to AWS EC2 (Pulls latest pushed commit from GitHub & rebuilds)

Write-Host "=== ☁️ Connecting to EC2 & Deploying Latest Pushed Code ===" -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no -i "medico-valley-key.pem" ubuntu@43.204.100.94 "cd /var/www/delta-healthcare && git pull origin main && cd backend && npm run build && pm2 restart medico-valley-backend && cd ../frontend && npm run build && pm2 restart medico-valley-frontend && pm2 status"

Write-Host "`n=== 🎉 SUCCESS! Live server updated at http://43.204.100.94 ===" -ForegroundColor Green
