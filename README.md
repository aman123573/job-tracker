# Job Tracker API

A RESTful API to track job applications built with Node.js, Express, PostgreSQL, and Redis. Includes JWT authentication, full CRUD operations, and Redis caching on GET requests to improve response time.

---

## Tech Stack

- Node.js + Express.js
- PostgreSQL
- Redis (ioredis)
- JWT + bcryptjs

---

## Installation

```bash
git clone https://github.com/aman123573/job-tracker.git
cd job-tracker
npm install
```

Create a `.env` file in the root:

```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=jobtracker
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_secret_key
REDIS_URL=redis://127.0.0.1:6379
```

Start the server:

```bash
npm run dev
```
