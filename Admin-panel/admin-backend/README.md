# EasyPG Admin Backend

Node.js/Express backend for EasyPG Admin Panel with JWT authentication and CRUD operations.

## Features

- JWT Authentication
- MongoDB Integration
- CRUD Operations for:
  - Users Management
  - Owners Management  
  - PGs Management
  - Documents Management
  - Complaints Management
  - Agreements Management
- Dashboard Statistics
- Input Validation
- Error Handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB server

4. Run the application:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Owners
- `GET /api/owners` - Get all owners
- `GET /api/owners/:id` - Get owner by ID
- `POST /api/owners` - Create new owner
- `PUT /api/owners/:id` - Update owner
- `DELETE /api/owners/:id` - Delete owner

### PGs
- `GET /api/pgs` - Get all PGs
- `GET /api/pgs/:id` - Get PG by ID
- `POST /api/pgs` - Create new PG
- `PUT /api/pgs/:id` - Update PG
- `DELETE /api/pgs/:id` - Delete PG

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Upload new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get complaint by ID
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Agreements
- `GET /api/agreements` - Get all agreements
- `GET /api/agreements/:id` - Get agreement by ID
- `POST /api/agreements` - Create new agreement
- `PUT /api/agreements/:id` - Update agreement
- `DELETE /api/agreements/:id` - Delete agreement

## Default Admin User

After starting the server, you can create an admin user with:
- Email: admin@example.com
- Password: admin123
- Role: admin

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time (default: 7d)
- `SMTP_SERVICE` - SMTP provider service name (example: `gmail`) OR use `SMTP_HOST`
- `SMTP_HOST` - SMTP server host (if `SMTP_SERVICE` is not set)
- `SMTP_PORT` - SMTP server port (default: `587`)
- `SMTP_SECURE` - `true` for SSL (usually port `465`), otherwise `false`
- `SMTP_USER` - SMTP login email/username
- `SMTP_PASS` - SMTP login password (for Gmail, use App Password)
- `SMTP_FROM` - Sender address shown in outgoing emails
