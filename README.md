# Task Manager Application

A full-stack task management application with user authentication. Live app available at [nwosehstasks.netlify.app](https://nwosehstasks.netlify.app/).

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
- Axios

**Backend**  
- Express
- PostgreSQL
- JSON Web Tokens

**Deployment**  
- Frontend: Netlify
- Backend: Heroku
