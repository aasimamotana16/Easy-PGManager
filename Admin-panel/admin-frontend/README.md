# EasyPG Admin Frontend

React admin panel for EasyPG management system with Tailwind CSS styling.

## Features

- Modern React UI with Tailwind CSS
- JWT Authentication
- Protected Routes
- Responsive Dashboard Layout
- CRUD Operations for:
  - Users Management
  - Owners Management
  - PGs Management
  - Documents Management
  - Complaints Management
  - Agreements Management
- Real-time Data Tables
- Search and Pagination
- Modal Forms
- Error Handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Project Structure

```
src/
├── components/
│   ├── CRUDTable.js      # Reusable table component
│   └── DashboardLayout.js # Main layout with sidebar
├── context/
│   └── AuthContext.js     # Authentication context
├── pages/
│   ├── Login.js          # Login page
│   ├── Dashboard.js      # Dashboard overview
│   ├── Users.js          # Users management
│   ├── Owners.js         # Owners management
│   ├── PGs.js            # PGs management
│   ├── Documents.js      # Documents management
│   ├── Complaints.js     # Complaints management
│   └── Agreements.js     # Agreements management
├── services/
│   └── api.js            # API service layer
├── utils/
│   └── cn.js             # Utility functions
├── App.js                # Main app component
├── index.css             # Global styles
└── index.js              # Entry point
```

## Features Overview

### Authentication
- Login/logout functionality
- JWT token management
- Protected routes
- Auto-logout on token expiration

### Dashboard
- Statistics overview
- Recent complaints
- Recent agreements
- Key metrics display

### Management Sections
Each section includes:
- Data table with search
- Add/Edit/Delete operations
- Pagination
- Status indicators
- Modal forms

### UI Components
- Responsive sidebar navigation
- Modern card-based layout
- Status badges
- Loading states
- Error handling
- Confirmation dialogs

## Default Login

Use these credentials to login:
- Email: admin@example.com
- Password: admin123

## Dependencies

- React 18
- React Router DOM
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons
- clsx and tailwind-merge for utility classes
