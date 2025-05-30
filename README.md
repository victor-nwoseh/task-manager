# Task Manager Application

A full-stack task management application with user authentication. Live app available at [personal-task-manager-frontend.onrender.com](https://personal-task-manager-frontend.onrender.com).

![Task Manager Screenshot](https://github.com/victor-nwoseh/task-manager/blob/main/Task%20Manager%20Screenshot.png)

## Features

- **User Authentication**
  - Secure JWT-based login/registration
  - Password hashing with bcrypt
  - Persistent sessions
- **Task Management**
  - CRUD operations for tasks
  - Status tracking (Pending/Completed)
  - Due date management
  - Search/filter by status
- **Security**
  - Rate limiting for auth endpoints
  - Helmet middleware for headers
  - CORS restrictions
- **Responsive Design**
  - Mobile-first approach
  - Cross-browser compatibility
  - Accessible UI components

## Tech Stack

**Frontend**  
- React
- Vite
- Modern ES6+ JavaScript

**Backend**  
- Express
- PostgreSQL
- JSON Web Tokens

**Deployment**  
- Frontend: Render (Static Site)
- Backend: Render (Web Service)
- Database: Render (PostgreSQL)

## Migration to Render

This project has been migrated from Netlify/Heroku to Render for unified hosting. The migration includes:

- Database hosted on Render PostgreSQL
- Backend API hosted on Render Web Service
- Frontend hosted on Render Static Site
- Environment-based API configuration
- Automated deployments via GitHub integration
