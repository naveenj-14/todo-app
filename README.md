# Todo App

A simple full-stack Todo application built with React, Express, PostgreSQL, Prisma, and Razorpay.

## Features

- User registration and login
- Secure HTTP-only authentication cookies
- Todo CRUD with user-level authorization
- Completed/uncompleted todo toggle
- Optional Razorpay donation flow
- Clean responsive UI

## Technologies

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Payment: Razorpay
- Security: Helmet, CORS, bcrypt, JWT, rate limiting

## Project Structure

```text
todo-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TodoForm.jsx
│   │   │   ├── TodoItem.jsx
│   │   │   ├── TodoList.jsx
│   │   │   └── DonationButton.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── paymentController.js
│   │   │   └── todoController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   └── todoRoutes.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
└── package.json
```

## Environment Variables

Create a backend `.env` file in `server/.env`.

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_app?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
CLIENT_URL="http://localhost:5173"
RAZORPAY_KEY_ID="your_test_key_id"
RAZORPAY_KEY_SECRET="your_test_key_secret"
NODE_ENV="development"
```

Frontend environment variables should go in `client/.env`.

```env
VITE_API_URL="http://localhost:5000"
VITE_RAZORPAY_KEY_ID="your_test_key_id"
```

## Local Setup

1. Install dependencies:

```bash
npm install --prefix server
npm install --prefix client
```

2. Set up PostgreSQL.

3. Create the database.

4. Run Prisma migrations.

5. Start the backend and frontend.

## PostgreSQL Setup

```bash
sudo -u postgres psql
CREATE DATABASE todo_app;
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER ROLE postgres WITH SUPERUSER;
```

If your local setup is different, update `DATABASE_URL` accordingly.

## Prisma Setup

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

## Run Backend

```bash
cd server
npm run dev
```

## Run Frontend

```bash
cd client
npm run dev
```

## Razorpay Test Setup

1. Create an account at Razorpay.
2. Go to the Dashboard.
3. Use test keys for development.
4. Add the test key ID and secret to the backend `.env` file.
5. Do not expose the secret in the frontend.

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Todos

- `GET /api/todos`
- `POST /api/todos`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`

### Payments

- `POST /api/payment/create-order`
- `POST /api/payment/verify`

## Deployment

### Frontend

Deploy the React app to a static host such as Vercel or Netlify.

Set environment variables for production, including:

```env
VITE_API_URL="https://your-backend-domain.com"
VITE_RAZORPAY_KEY_ID="production_public_key"
```

### Backend

Deploy the Express server to Render, Railway, Heroku, or similar.

Set environment variables on the hosting platform:

```env
PORT=5000
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
CLIENT_URL="https://your-frontend-domain.com"
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
NODE_ENV="production"
```

### PostgreSQL

Use a managed PostgreSQL provider such as Supabase, Neon, or a cloud database.

### Razorpay

Use your production keys only in production. Keep the secret server-side.

## Security Notes

- Passwords are hashed using bcrypt.
- Cookies are HTTP-only and secure in production.
- JWTs are never stored in localStorage.
- Todo ownership is enforced on every backend request.
- Razorpay signatures are verified server-side.
- `.env` files are never committed.
- Production requires HTTPS.

## GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```
