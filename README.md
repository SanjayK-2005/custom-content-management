# Custom Content Management System (CMS)

A modern, lightweight content management system built with Node.js, Express, and MySQL. This CMS provides a simple yet powerful platform for managing blog posts and content with user authentication and role-based access control.

## Features

- 🔐 **User Authentication**
  - Secure login and registration
  - JWT-based authentication
  - Token persistence across sessions
  - Role-based access control (Admin/Editor)

- 📝 **Content Management**
  - Create, read, update, and delete blog posts
  - Post status management (Draft/Published)
  - Rich text content support
  - Post metadata and author tracking

- 🎨 **Modern UI/UX**
  - Responsive dashboard interface
  - Modal-based post editor
  - Real-time error feedback
  - Clean and intuitive design

- 🛠 **Technical Features**
  - RESTful API architecture
  - MySQL database integration
  - Environment-based configuration
  - Secure password hashing
  - Cross-Origin Resource Sharing (CORS) support

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd custom-content-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   API_URL=http://localhost:3000/api

   # Database Configuration
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key

   # SSL Configuration (if needed)
   SSL_CA_PATH=your-ssl-ca-path
   ```

4. Initialize the database:
   ```bash
   npm run init-db
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the CMS:
   - Open your browser and navigate to `http://localhost:3000`
   - Register a new account or login with existing credentials
   - Start managing your content through the dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate authentication token

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

## Project Structure

```
custom-content-management/
├── config/
│   ├── db.js
│   └── init.sql
├── middleware/
│   └── authMiddleware.js
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── routes/
│   ├── auth.js
│   ├── posts.js
│   └── config.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- SQL injection protection
- XSS protection through input sanitization

## Development

To contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run init-db` - Initialize database tables

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| API_URL | API base URL | http://localhost:3000/api |
| DB_HOST | Database host | - |
| DB_USER | Database user | - |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | - |
| DB_PORT | Database port | 3306 |
| JWT_SECRET | JWT signing key | - |

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.

## Acknowledgments

- Express.js team
- MySQL team
- JWT implementation contributors
- Frontend design inspiration from modern CMS platforms 