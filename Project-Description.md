

## Project Guide: Custom Content Management System (CMS)

**Project Goal:** To build a web-based Content Management System (CMS) that allows users (with different roles) to create, read, update, and delete (CRUD) blog content via a user-friendly dashboard.

**Target Audience:** Developers with basic knowledge of HTML, CSS, JavaScript, and some familiarity with server-side concepts and databases (specifically MySQL).

**Timeline:** November 2024 - December 2024 (as specified)

**Core Features:**

1.  **User Authentication:** Secure login for users.
2.  **User Roles:** Different permission levels (e.g., Admin, Editor).
3.  **Dashboard:** Central place for managing content after login.
4.  **Content CRUD:** Create new blog posts, view existing posts, edit posts, delete posts.
5.  **Media Management (Basic):** Ability to include image URLs in posts (full file upload is an advanced feature).
6.  **Responsive Design:** The interface should adapt to different screen sizes.

**Technology Stack:**

1.  **Frontend (Client-Side):**
    *   **HTML:** Structures the web pages (forms, content display, dashboard layout).
    *   **CSS:** Styles the appearance (layout, colors, fonts, responsiveness).
    *   **JavaScript (Vanilla JS or a Framework):** Handles user interactions, makes requests to the backend (API calls), manipulates the DOM dynamically.
2.  **Backend (Server-Side):**
    *   **Node.js with Express.js:** (***Crucial Addition***) While not explicitly listed in your tools, you *need* a server-side language to interact securely with the MySQL database from a web browser. Node.js/Express is a very common choice when the frontend uses JavaScript. It will handle API requests, business logic, authentication, and database communication.
    *   **Libraries:** `mysql2` (to connect Node.js to MySQL), `bcrypt` (for password hashing), `jsonwebtoken` or `express-session` (for managing login sessions/tokens).
3.  **Database:**
    *   **MySQL:** Stores user information, blog posts, and potentially media metadata.

---

### I. Conceptual Overview & Architecture

1.  **What is a CMS?** A system that allows users to manage digital content (like text, images, videos) for a website without needing deep technical knowledge of web development. WordPress and Drupal are popular examples.
2.  **How it Works (High-Level):**
    *   A user interacts with the **Frontend** (HTML/CSS/JS pages) in their browser.
    *   Actions (like logging in, saving a post) trigger **JavaScript** to send requests (e.g., using `fetch`) to the **Backend API** (built with Node.js/Express).
    *   The **Backend** processes the request:
        *   Validates data.
        *   Checks user permissions (authentication/authorization).
        *   Interacts with the **MySQL Database** (e.g., fetches posts, saves new user data).
    *   The **Backend** sends a response (often JSON data or a status message) back to the **Frontend**.
    *   **JavaScript** receives the response and updates the user interface (e.g., displays posts, shows a success message, redirects the user).

    ```mermaid
    graph LR
        A[User Browser (HTML/CSS/JS)] <-- Renders UI --> A;
        A -- API Request (e.g., Login, Save Post) --> B(Backend Server - Node.js/Express);
        B -- Database Query (e.g., SELECT, INSERT) --> C(MySQL Database);
        C -- Query Result --> B;
        B -- API Response (e.g., User Data, Success Status) --> A;
    ```

---

### II. Database Schema Design (MySQL)

You'll need at least two main tables: `users` and `posts`.

1.  **`users` Table:** Stores information about registered users.
    ```sql
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, NOT plain text!
        role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```
2.  **`posts` Table:** Stores the blog content.
    ```sql
    CREATE TABLE posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL, -- Can store large amounts of text (the blog post body)
        author_id INT NOT NULL,
        status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE -- Link post to an author
    );
    ```
    *Optional `media` Table (Advanced):*
    ```sql
    -- For a more robust system, you might add:
    -- CREATE TABLE media (
    --    id INT AUTO_INCREMENT PRIMARY KEY,
    --    filename VARCHAR(255) NOT NULL,
    --    filepath VARCHAR(255) NOT NULL, -- Path where the file is stored on the server
    --    mime_type VARCHAR(50),
    --    uploaded_by INT NOT NULL,
    --    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    --    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    -- );
    ```

---

### III. Step-by-Step Implementation Guide

**Phase 1: Setup & Backend Foundation**

1.  **Environment Setup:**
    *   Install Node.js and npm (Node Package Manager).
    *   Install MySQL Server and a management tool (like MySQL Workbench or phpMyAdmin).
    *   Create a new project directory (e.g., `my-cms`).
    *   Navigate into the directory in your terminal and run `npm init -y` to create a `package.json` file.
2.  **Install Dependencies:**
    ```bash
    npm install express mysql2 bcrypt jsonwebtoken dotenv cors
    # Or use express-session instead of jsonwebtoken if preferred
    # npm install express express-session mysql2 bcrypt dotenv cors
    ```
    *   `express`: Web framework for Node.js.
    *   `mysql2`: MySQL client for Node.js (better performance than `mysql`).
    *   `bcrypt`: For securely hashing passwords.
    *   `jsonwebtoken` (JWT): For creating tokens to manage user sessions upon login. *Alternatively, use `express-session` for server-side sessions.*
    *   `dotenv`: To manage environment variables (like database credentials).
    *   `cors`: To enable Cross-Origin Resource Sharing (allows your frontend to talk to your backend if they are on different origins during development).
3.  **Project Structure (Example):**
    ```
    my-cms/
    ├── public/          # Static frontend files (HTML, CSS, JS)
    │   ├── index.html
    │   ├── dashboard.html
    │   ├── login.html
    │   ├── css/
    │   │   └── style.css
    │   └── js/
    │       └── script.js
    ├── server.js        # Main backend entry point
    ├── config/          # Configuration files
    │   └── db.js        # Database connection setup
    ├── routes/          # API route definitions
    │   ├── auth.js      # Authentication routes (login, register)
    │   └── posts.js     # Post CRUD routes
    ├── middleware/      # Custom middleware (e.g., authentication checks)
    │   └── authMiddleware.js
    ├── .env             # Environment variables (DB_HOST, DB_USER, etc. - DO NOT COMMIT)
    ├── package.json
    └── package-lock.json
    ```
4.  **Database Connection (`config/db.js`):**
    *   Use the `mysql2` library to create a connection pool to your MySQL database. Read credentials from environment variables (`.env` file).
5.  **Basic Express Server (`server.js`):**
    *   Require `express`, `cors`, `dotenv`.
    *   Configure middleware (`express.json()` for parsing JSON bodies, `cors()`).
    *   Define basic API routes (start with a simple `/` route).
    *   Listen on a port (e.g., 3000 or 5000).
    *   Mount the API route handlers from the `routes/` directory.
    *   Optionally serve static files from the `public` directory using `express.static('public')`.

**Phase 2: Authentication**

1.  **User Registration (`routes/auth.js`):**
    *   Create a `POST /api/auth/register` endpoint.
    *   Receive username, email, password, and role (optional, default to 'editor') from the request body.
    *   **Hash the password** using `bcrypt.hash()`. Never store plain text passwords!
    *   Insert the new user into the `users` table in MySQL.
    *   Send back a success response.
2.  **User Login (`routes/auth.js`):**
    *   Create a `POST /api/auth/login` endpoint.
    *   Receive email/username and password from the request body.
    *   Find the user in the database by email/username.
    *   If user found, compare the provided password with the stored hash using `bcrypt.compare()`.
    *   If passwords match:
        *   Generate a JWT containing user ID and role (`jsonwebtoken.sign()`). Send this token back to the client.
        *   *Alternatively, using `express-session`*: Create a session for the user.
    *   If passwords don't match or user not found, send an error response.
3.  **Authentication Middleware (`middleware/authMiddleware.js`):**
    *   Create middleware to protect routes that require login.
    *   It should check for a valid JWT in the request headers (Authorization: Bearer <token>) or a valid session cookie.
    *   Verify the token/session. If valid, extract user info (ID, role) and attach it to the `request` object (e.g., `req.user`). If invalid, send a 401 Unauthorized error.

**Phase 3: Content Management (Posts CRUD)**

1.  **Create Posts (`routes/posts.js`):**
    *   `POST /api/posts`: Requires authentication (use auth middleware).
    *   Get title, content, status from request body. Get `author_id` from `req.user` (added by auth middleware).
    *   Insert the new post into the `posts` table.
    *   Send back the newly created post data or a success message.
2.  **Read Posts (`routes/posts.js`):**
    *   `GET /api/posts`: Can be public or require authentication depending on your needs. Fetches a list of *published* posts. Add filtering/pagination later.
    *   `GET /api/posts/all`: (Admin/Editor only - use auth middleware + role check) Fetches *all* posts (drafts and published).
    *   `GET /api/posts/:id`: Fetches a single post by its ID.
3.  **Update Posts (`routes/posts.js`):**
    *   `PUT /api/posts/:id`: Requires authentication.
    *   Get post ID from URL parameters (`req.params.id`). Get updated title, content, status from request body.
    *   **Authorization Check:** Ensure the logged-in user (`req.user.id`) is the author of the post OR is an 'admin'.
    *   Update the corresponding post in the database.
    *   Send back the updated post data or success message.
4.  **Delete Posts (`routes/posts.js`):**
    *   `DELETE /api/posts/:id`: Requires authentication.
    *   Get post ID from URL parameters.
    *   **Authorization Check:** Ensure the logged-in user is the author OR is an 'admin'.
    *   Delete the post from the database.
    *   Send back a success message.

**Phase 4: Frontend Development (HTML, CSS, JavaScript)**

1.  **Login Page (`public/login.html` or similar):**
    *   HTML form with fields for email/username and password.
    *   JavaScript:
        *   Add event listener to the form submission.
        *   Prevent default form submission.
        *   Get values from input fields.
        *   Send a `fetch` request (`POST`) to `/api/auth/login` with the credentials.
        *   Handle the response:
            *   If successful: Store the received JWT token (e.g., in `localStorage`) or rely on the session cookie set by the server. Redirect the user to the dashboard (`dashboard.html`).
            *   If error: Display an error message to the user.
2.  **Dashboard Page (`public/dashboard.html`):**
    *   This is the main interface after login.
    *   JavaScript:
        *   On page load, check if the user is logged in (check for token/session). If not, redirect to `login.html`.
        *   Fetch the user's posts (or all posts if admin) from `/api/posts` (remember to include the JWT token in the `Authorization` header of the `fetch` request).
        *   Dynamically render the list of posts (title, status, action buttons like Edit/Delete).
        *   Include a "Create New Post" button/link.
        *   **Role-Based UI:** Show/hide certain elements (e.g., "Manage Users" link for admins) based on the user's role (decoded from JWT or fetched from a `/api/user/me` endpoint).
3.  **Post Editor (Could be part of `dashboard.html` or a separate `editor.html`):**
    *   HTML form with fields for title, content (use a `<textarea>`), and status (dropdown/radio buttons).
    *   JavaScript:
        *   If editing, fetch the existing post data using `/api/posts/:id` and populate the form.
        *   Handle form submission:
            *   If creating: Send `POST` request to `/api/posts`.
            *   If editing: Send `PUT` request to `/api/posts/:id`.
        *   Include the JWT token in request headers.
        *   Handle success/error responses (e.g., redirect back to dashboard or show message).
4.  **Styling & Responsiveness (`public/css/style.css`):**
    *   Apply CSS rules to make the login page, dashboard, and forms look clean and professional.
    *   Use CSS Media Queries (`@media`) to ensure the layout adapts well to different screen sizes (desktops, tablets, mobiles). Consider using Flexbox or Grid for layout.

**Phase 5: Implementing Core Features**

1.  **User Roles:**
    *   **Backend:** In middleware and route handlers, check `req.user.role` before allowing certain actions (e.g., only 'admin' can delete *any* post, 'editor' can only delete their own).
    *   **Frontend:** Fetch the user's role after login. Use JavaScript `if` statements to conditionally show/hide UI elements meant only for specific roles.
2.  **Media Management (Basic):**
    *   Allow users to paste image URLs directly into the content `<textarea>`. The browser will render them when the post is displayed.
    *   *Advanced:* Implement file uploads using libraries like `multer` on the backend to handle `multipart/form-data`, save files to the server, and store file paths in the database (potentially in the `media` table or directly in the `posts` table if simple).
3.  **Dashboard UI:**
    *   Display a list of posts fetched from the API. Include title, author (fetch username based on `author_id`), status, and created/updated dates.
    *   Add "Edit" and "Delete" buttons next to each post (ensure delete asks for confirmation). These buttons should trigger relevant API calls via JavaScript.

---

### IV. Key Code Snippets / Examples

**Example: Backend Post Route (Express)**
```javascript
// routes/posts.js
const express = require('express');
const db = require('../config/db'); // Your DB connection module
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// GET all posts (protected example)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Example: Fetch only published posts, or all if admin
    let query = 'SELECT p.id, p.title, p.status, p.created_at, u.username as author FROM posts p JOIN users u ON p.author_id = u.id';
    if (req.user.role !== 'admin') {
        query += ' WHERE p.status = "published" OR p.author_id = ?';
    }
     query += ' ORDER BY p.created_at DESC';

    const [posts] = await db.promise().query(query, req.user.role !== 'admin' ? [req.user.id] : []);
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// POST create new post (protected)
router.post('/', authMiddleware, async (req, res) => {
    const { title, content, status } = req.body;
    const author_id = req.user.id; // From auth middleware

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const query = 'INSERT INTO posts (title, content, author_id, status) VALUES (?, ?, ?, ?)';
        const [result] = await db.promise().query(query, [title, content, author_id, status || 'draft']);
        res.status(201).json({ id: result.insertId, title, content, author_id, status: status || 'draft' });
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: 'Error creating post' });
    }
});

// Add PUT and DELETE routes similarly, including authorization checks

module.exports = router;
```

**Example: Frontend Fetch Request (JavaScript)**
```javascript
// public/js/script.js

async function fetchPosts() {
    const token = localStorage.getItem('authToken'); // Get JWT from storage
    if (!token) {
        window.location.href = '/login.html'; // Redirect if not logged in
        return;
    }

    try {
        const response = await fetch('/api/posts', { // Your API endpoint
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include token
            }
        });

        if (!response.ok) {
            if (response.status === 401) window.location.href = '/login.html'; // Token expired/invalid
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const posts = await response.json();
        displayPosts(posts); // Function to update the DOM
    } catch (error) {
        console.error('Error fetching posts:', error);
        // Display error message to user
    }
}

function displayPosts(posts) {
    const postsList = document.getElementById('posts-list'); // Assuming you have a <ul> or <div>
    postsList.innerHTML = ''; // Clear existing list

    posts.forEach(post => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <h3>${escapeHTML(post.title)}</h3>
            <p>Status: ${escapeHTML(post.status)} | Author: ${escapeHTML(post.author)}</p>
            <button onclick="editPost(${post.id})">Edit</button>
            <button onclick="deletePost(${post.id})">Delete</button>
        `;
        postsList.appendChild(listItem);
    });
}

// Simple function to prevent basic XSS
function escapeHTML(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}


// Call fetchPosts when the dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) { // Check if on dashboard
         fetchPosts();
    }
    // Add event listeners for login form, post forms etc.
});

// Add functions for editPost(id), deletePost(id), handleLoginFormSubmit(), handlePostFormSubmit() etc.
// These functions will make PUT, DELETE, POST fetch requests respectively.
```

---

### V. Further Enhancements (Optional)

*   **WYSIWYG Editor:** Integrate a rich text editor (like TinyMCE, Quill.js, or CKEditor) for the content field instead of a plain `<textarea>`.
*   **File Uploads:** Implement proper image/media uploading and storage.
*   **Categories/Tags:** Add functionality to categorize or tag posts.
*   **Search/Filtering:** Allow users to search for posts or filter by status/author.
*   **Password Reset:** Implement a secure "forgot password" feature.
*   **Frontend Framework:** Consider using a framework like React, Vue, or Angular for a more structured and maintainable frontend, especially if the project grows complex.
*   **Input Validation:** Add more robust validation on both frontend and backend.
*   **Security Hardening:** Sanitize all user inputs on the backend (to prevent SQL injection and XSS), implement rate limiting, use HTTPS.

---
Database config:

Service URI=
mysql://avnadmin:AVNS_LmFkDavAarSOPpXooK5@cms-cms-project.h.aivencloud.com:26341/defaultdb?ssl-mode=REQUIRED

Database name=
defaultdb

Host=
cms-cms-project.h.aivencloud.com

Port=
26341

User=
avnadmin

Password=
AVNS_LmFkDavAarSOPpXooK5

SSL mode=
REQUIRED
