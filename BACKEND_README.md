# 🔧 civicpulse Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 14+
- npm/yarn

### Installation
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

## 📡 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api`
- **Swagger UI**: `http://localhost:5000/api-docs`

## 🔐 Authentication

### Register User
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🎯 Issues API

### Get All Issues
```bash
GET /api/issues
```

### Create Issue (with file upload)
```bash
POST /api/issues
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic issues",
  "location": "Main Street & 5th Ave",
  "category": "road",
  "file": [uploaded_image.jpg]
}
```

### Update Issue Status (Admin only)
```bash
PATCH /api/issues/:id/status
Content-Type: application/json
Authorization: Bearer ADMIN_JWT_TOKEN

{
  "status": "in-progress"
}
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin/User permissions
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Express-validator middleware
- **File Upload Security**: Multer with file type validation
- **CORS Protection**: Configured for frontend domain
- **Helmet.js**: Security headers
- **XSS Protection**: Clean user inputs

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js           # Database connection
│   └── swagger.js      # API documentation config
├── controllers/
│   ├── auth.js         # Authentication logic
│   └── issues.js       # Issues CRUD operations
├── middlewares/
│   ├── validate.js     # JWT & validation middleware
│   ├── upload.js       # File upload handling
│   └── errorHandler.js # Global error handling
├── models/
│   ├── userModel.js    # User database operations
│   └── issues.js       # Issues database operations
├── routes/
│   ├── auth.js         # Authentication routes
│   └── issues.js       # Issues routes
├── uploads/            # File storage directory
└── server.js          # Express app entry point
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Issues Table
```sql
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  image_url VARCHAR(500),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=civicpulse_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h

# Admin Domain
DOMAIN_NAME=@admin.civicpulse.com

# Email (if implemented)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🧪 Testing API with cURL

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Issues API
```bash
# Get all issues
curl -X GET http://localhost:5000/api/issues

# Create issue with file
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Issue" \
  -F "description=Test Description" \
  -F "location=Test Location" \
  -F "category=road" \
  -F "file=@/path/to/image.jpg"
```

## 📊 API Response Examples

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Pothole on Main Street",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔄 Development Workflow

```bash
# Start development server
npm run dev

# Run with different environments
NODE_ENV=production npm start

# Check API documentation
open http://localhost:5000/api-docs
```

## 📈 Performance Features

- **Rate Limiting**: Prevents API abuse
- **File Upload Optimization**: Efficient image handling
- **Database Indexing**: Optimized queries
- **Error Handling**: Comprehensive error responses
- **Logging**: Request/response logging (if implemented)

## 🔍 Monitoring & Debugging

### Health Check
```bash
GET /api/health
# Returns server status and database connection
```

### Logs Location
- Development: Console output
- Production: `logs/` directory (if configured)

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure database connection
3. Set up file storage (local/cloud)
4. Configure CORS for production domain

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-endpoint`
3. Make changes and test
4. Submit pull request

## 📞 Support

- **API Issues**: Check `/api-docs` for detailed documentation
- **Database Issues**: Verify connection strings and permissions
- **Authentication Issues**: Ensure JWT_SECRET is set correctly


### Testing
*   **Backend Testing:** Jest, Supertest, MongoDB Memory Server
*   **Frontend Unit/Component Testing:** Vitest, React Testing Library
*   **Frontend E2E Testing:** Cypress

---


## ✅ Running Tests

We have a comprehensive testing suite to ensure code quality and stability.

### Backend Tests (Jest & Supertest)

These tests cover the API endpoints. They run against an in-memory MongoDB database to ensure a clean, isolated environment for each test run, preventing any impact on your development database.

To run all backend tests, navigate to the `/backend` directory and run:
```sh
npm test
```

### Frontend Unit & Component Tests (Vitest)

These tests verify that individual React components render and behave correctly in isolation. We use Vitest and React Testing Library for this.

To run all frontend unit tests, navigate to the `/frontend` directory and run:
```sh
npm test
```

### Frontend End-to-End (E2E) Tests (Cypress)

E2E tests simulate real user workflows in a browser from start to finish. This helps catch bugs in critical user journeys like logging in, creating a post, or navigating the application.

To open the Cypress Test Runner, navigate to the `/frontend` directory and run:
```sh
npm run cypress:open
```

