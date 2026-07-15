# Express.js Backend API Documentation

This directory contains the REST API backend of the Social Feed / Blog application, built using Node.js, Express.js (v5), and MongoDB with Mongoose.

---

## 🏗️ Folder Structure

The server is structured using a service-oriented MVC architecture:

```
server/
├── app/
│   ├── controllers/      # Route controllers (processes requests, structures responses)
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── postController.js
│   │   └── replyController.js
│   ├── middlewares/      # Express middle-tier hooks (CORS, JWT auth, file upload)
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/           # Mongoose schemas/models defining MongoDB structure
│   │   ├── Comment.js
│   │   ├── Post.js
│   │   ├── Reply.js
│   │   └── User.js
│   └── services/         # Core business logic (database actions, API integrations)
│       ├── authService.js
│       ├── commentService.js
│       ├── postService.js
│       └── replyService.js
├── configs/              # System and provider settings (db connection, Cloudinary, Env)
│   ├── db.js
│   ├── env.js
│   └── cloudinary.js
├── routes/               # API endpoint route configurations
│   ├── auth.js
│   ├── comments.js
│   ├── index.js
│   ├── posts.js
│   └── replies.js
├── .env                  # Configuration variables (secrets, connection strings)
├── app.js                # Express app setup and middleware configuration
├── server.js             # API server entrypoint (db connect and listen)
└── package.json          # Node dependencies and scripts
```

---

## 🛠️ Prerequisites & Setup

### Requirements
- **Node.js**: v18.0.0 or higher
- **MongoDB**: A running MongoDB Atlas instance or local MongoDB server

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create Configuration (`.env`)**:
   Create a `.env` file in the root of the `server/` directory and populate it with the following configuration:
   ```env
   PORT=5001
   CLIENT_URL=http://localhost:3000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_signing_key_here
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```

3. **Running the Application**:
   - **Development Mode** (Runs with `nodemon` for auto-reloading on save):
     ```bash
     npm run dev
     ```
   - **Production Mode**:
     ```bash
     npm run start
     ```
   Once started, the backend will be available at [http://localhost:5001](http://localhost:5001).

---

## 🛡️ Authentication Architecture

The API supports two authentication flows, both resulting in a JWT cookie session:

1. **Credential-based Auth (Email & Password)**:
   - Users are registered using `POST /api/auth/register` (passwords hashed using `bcrypt`).
   - Authenticated using `POST /api/auth/login`.

2. **Google OAuth 2.0 Identity Verification**:
   - The React client passes a Google ID Token credential (obtained via Google Login API) to `POST /api/auth/google`.
   - The backend validates the token using `google-auth-library` and verifies the audience against `GOOGLE_CLIENT_ID`.
   - If the user doesn't exist, a new account is automatically registered using Google account profile details.

### Session Management
Once verified, a JWT token is created and sent back to the client inside an **HttpOnly secure cookie** named `token`. This protects against XSS token extraction.
The global `authMiddleware.js` parses and decodes this cookie to authenticate users for secure endpoints.

---

## 📁 Media Upload Pipeline

The application manages media uploads (such as post attachments) using:
- **Multer**: Configured as memory storage for buffering.
- **Cloudinary**: Images are streamed directly to the cloud and stored in web-friendly formats, returning a static image URL.
- Routes handling single image attachment use the `upload.single("image")` middleware.

---

## 🗄️ Database Schemas (MongoDB / Mongoose)

### 1. User
Represents an application user.

| Field | Type | Rules |
| :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated |
| `firstName` | String | Required, trimmed |
| `lastName` | String | Required, trimmed |
| `email` | String | Required, unique, lowercase, trimmed |
| `password` | String | Required (min length 6, excluded from default queries) |
| `avatar` | String | Default `null` |
| `createdAt` | Date | Auto-generated timestamp |
| `updatedAt` | Date | Auto-generated timestamp |

### 2. Post
Represents a blog / status update. Supports shared posts.

| Field | Type | Rules |
| :--- | :--- | :--- |
| `author` | ObjectId | Required, ref to `User` |
| `text` | String | Optional, max length 5000, trimmed |
| `image` | String | Optional, default `null` (Cloudinary URL) |
| `visibility` | String | Enum: `["public", "private"]`, default `"public"` |
| `likes` | Array of ObjectIds | List of `User` IDs who liked the post |
| `sharedFrom` | ObjectId | Reference to original `Post` (if shared), default `null` |
| `shares` | Number | Count of shares, default `0` |

### 3. Comment
Represents feedback on a Post.

| Field | Type | Rules |
| :--- | :--- | :--- |
| `post` | ObjectId | Required, ref to `Post` |
| `author` | ObjectId | Required, ref to `User` |
| `text` | String | Required, max length 2000, trimmed |
| `likes` | Array of ObjectIds | List of `User` IDs who liked the comment |

### 4. Reply
Represents a response to a Comment.

| Field | Type | Rules |
| :--- | :--- | :--- |
| `comment` | ObjectId | Required, ref to `Comment` |
| `author` | ObjectId | Required, ref to `User` |
| `text` | String | Required, max length 2000, trimmed |
| `likes` | Array of ObjectIds | List of `User` IDs who liked the reply |

---

## 🛰️ API Endpoint Reference

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Payload / Parameters |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account | No | `{ firstName, lastName, email, password }` |
| `POST` | `/api/auth/login` | Login with email and password | No | `{ email, password }` |
| `POST` | `/api/auth/google` | Google sign-in / signup verify | No | `{ token }` (Google Credential ID token) |
| `GET` | `/api/auth/me` | Fetch active user information | **Yes** | Uses cookie token |

### 2. Posts (`/api/posts`)

All endpoints in the posts route require authentication.

| Method | Endpoint | Description | Payload / Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/posts` | Create new post (supports multipart image file) | Form-data: `text`, `visibility` (optional), `image` (file attachment) |
| `GET` | `/api/posts` | List posts feed (most recent first) | Query string: `page` (default 1), `limit` (default 10) |
| `GET` | `/api/posts/:id` | Fetch specific post by ID | Path param: `id` |
| `PUT` | `/api/posts/:id` | Update post content or replace image | Form-data: `text`, `visibility`, `image` (file attachment) |
| `DELETE` | `/api/posts/:id` | Delete post (only if author) | Path param: `id` |
| `POST` | `/api/posts/:id/like` | Toggle like status on post | Path param: `id` |
| `POST` | `/api/posts/:id/share` | Share post to profile | Path param: `id`, Optional body: `{ text }` |
| `POST` | `/api/posts/:id/comments` | Add comment to post | Body: `{ text }` |
| `GET` | `/api/posts/:id/comments` | Get comments for post | Path param: `id` |

### 3. Comments (`/api/comments`)

All endpoints in the comments route require authentication.

| Method | Endpoint | Description | Payload / Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/comments/:id/like` | Toggle like status on comment | Path param: `id` (comment ID) |
| `POST` | `/api/comments/:id/replies` | Reply to comment | Path param: `id` (comment ID), Body: `{ text }` |
| `DELETE` | `/api/comments/:id` | Delete comment (only if author) | Path param: `id` (comment ID) |

### 4. Replies (`/api/replies`)

All endpoints in the replies route require authentication.

| Method | Endpoint | Description | Payload / Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/replies/:id/like` | Toggle like status on reply | Path param: `id` (reply ID) |
| `DELETE` | `/api/replies/:id` | Delete reply (only if author) | Path param: `id` (reply ID) |
