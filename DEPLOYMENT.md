# Deployment Guide - Render

This guide explains how to deploy the Personal Task Manager application to Render.

## Prerequisites

1. A GitHub account with your code repository
2. A Render account (free tier available)

## Step-by-Step Deployment

### 1. Database Setup

1. Log into your Render dashboard
2. Click "New" → "PostgreSQL"
3. Configure the database:
   - **Name**: `personal-task-manager-db`
   - **Database**: `personal_task_manager`
   - **User**: `task_manager_user`
   - **Plan**: Free
4. Click "Create Database"
5. Note the database connection details for later

### 2. Backend Deployment

1. In Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `personal-task-manager-backend`
   - **Environment**: Node
   - **Build Command**: `npm install && node scripts/build-and-init.js`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Set environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (link to your PostgreSQL database)
   - `JWT_SECRET`: (auto-generate or set your own)
   - `PORT`: `10000`
5. Click "Create Web Service"

### 3. Database Initialization (Automatic)

The database schema will be automatically initialized during the deployment process. You don't need shell access! The system will:

1. **During Build**: Attempt to initialize the database if possible
2. **During Startup**: Initialize the database if it wasn't done during build
3. **Skip if exists**: Won't recreate tables if they already exist

You can monitor the initialization process in the deployment logs. Look for messages like:
- "Database schema initialized successfully" ✅
- "Database tables already exist, skipping initialization" ✅
- "Database will be initialized when the service starts" ⚠️ (normal during build)

### 4. Frontend Deployment

1. In Render dashboard, click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure the site:
   - **Name**: `personal-task-manager-frontend`
   - **Build Command**: `cd frontend && npm ci && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Set environment variables:
   - `NODE_ENV`: `production`
5. Click "Create Static Site"

**Note**: If the build fails with "vite: not found", try these alternative build commands:
- `cd frontend && npm install --production=false && npm run build`
- `cd frontend && npm install && npx vite build`

### 5. Update API Configuration

The frontend is already configured to use the correct API endpoints based on the environment. Make sure your backend service URL matches the one in `frontend/src/config/api.js`:

```javascript
production: 'https://personal-task-manager-backend.onrender.com'
```

Update this URL to match your actual backend service URL from Render.

## Environment Variables Reference

### Backend Service
- `NODE_ENV`: `production`
- `DATABASE_URL`: Automatically provided by Render PostgreSQL
- `JWT_SECRET`: Auto-generated secure key
- `PORT`: `10000` (Render's default)

### Frontend Static Site
- `NODE_ENV`: `production`

## Automatic Deployments

Both services will automatically redeploy when you push changes to your GitHub repository's main branch.

## Troubleshooting

### Frontend Build Issues
- **"vite: not found" error**: Vite has been moved to dependencies, redeploy after pushing the updated package.json
- **Build command alternatives**:
  - `cd frontend && npm install --production=false && npm run build`
  - `cd frontend && npm install && npx vite build`
- **Clear build cache**: Try redeploying from scratch

### Database Connection Issues
- Verify the DATABASE_URL environment variable is correctly linked
- Check that the database service is running
- Check deployment logs for database initialization messages

### Database Initialization Issues
- The system tries to initialize during build and startup
- If build-time initialization fails, it will retry during startup
- Check logs for "Database schema initialized successfully"
- Tables won't be recreated if they already exist

### CORS Issues
- Verify the frontend URL is added to the CORS allowlist in `server.js`
- Check that both services are using HTTPS in production

### Build Failures
- Check the build logs in Render dashboard
- Ensure all dependencies are listed in package.json
- Verify Node.js version compatibility

## Monitoring

- Use Render's built-in logging to monitor application health
- Set up alerts for service downtime
- Monitor database usage and performance
- Check logs for database initialization status

## Cost Considerations

- Free tier includes:
  - 750 hours/month for web services
  - 1GB storage for PostgreSQL
  - 100GB bandwidth
- Services may spin down after 15 minutes of inactivity on free tier
- Consider upgrading to paid plans for production use

## No Shell Access Required

This deployment is designed to work entirely with Render's free tier without requiring shell access. Database initialization happens automatically during the deployment process. 