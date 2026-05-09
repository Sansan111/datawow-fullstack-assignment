# Concert Reservation System

Fullstack concert ticket reservation app. Next.js for frontend, NestJS for backend, PostgreSQL for database.

## Quick Start (Docker)

Make sure Docker and Docker Compose are installed, then just run:

```bash
docker-compose up --build
```

Done. Everything starts together:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

Database migrations run automatically on startup so you don't need to do anything else.

## Quick Start (Local Dev)

**1. Start the database**

```bash
docker-compose up db
```

**2. Backend**

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Since this is not a production app, I've included the env values directly in `docker-compose.yml` so you can get it running quickly without creating any `.env` files when using Docker.

For local development, create these files:

`backend/.env`
```
DATABASE_URL="postgresql://root:password123@localhost:5433/concert_db?schema=public"
JWT_SECRET="supersecretkey"
PORT=3001
```

`frontend/.env.local` (Next.js uses `.env.local` by default for local dev)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Project Structure

```
├── frontend/          Next.js (App Router)
│   ├── src/app/
│   │   ├── page.tsx           Landing page - pick User or Admin
│   │   ├── login/             User login
│   │   ├── register/          User register
│   │   ├── user/              User dashboard + reservation history
│   │   ├── admin/             Admin dashboard + audit history
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── components/        Reusable components (sidebar, toast, etc.)
│   │   └── lib/               Axios setup, auth helpers, API functions
│
├── backend/           NestJS
│   ├── src/
│   │   ├── auth/              Login, register, JWT strategy, role guard
│   │   ├── concerts/          CRUD for concerts
│   │   ├── reservations/      Reserve, cancel, history
│   │   └── prisma/            Prisma service
│   └── prisma/
│       └── schema.prisma      DB schema and migrations
│
└── docker-compose.yml
```

### How it works

- Landing page lets you choose User or Admin, then login or register
- Admin can create and delete concerts, and view reservation history of all users
- User can see all concerts, reserve a ticket (max 1 per concert), cancel, and view their own history
- Auth uses JWT. The token has the user's role in it, and NestJS guards check that role before allowing access
- Database has a unique constraint on (userId, concertId) to prevent double booking

## Libraries

**Backend**
- NestJS - framework
- Prisma - ORM and migrations
- PostgreSQL - database (runs in Docker)
- Passport + passport-jwt - JWT auth
- class-validator - validate request body
- bcrypt - hash passwords

**Frontend**
- Next.js 15 with App Router
- Tailwind CSS v4
- Axios

## Tests

```bash
cd backend
npm test
```

With coverage:
```bash
npm run test:cov
```

What's tested:
- Concert create, list, delete, and handling when concert doesn't exist
- Reservation: booking a seat, trying to book when full, duplicate booking, canceling, canceling someone else's reservation

## API

**Auth**
- `POST /auth/register` - create account
- `POST /auth/login` - login, returns JWT token

**Concerts** (need to be logged in)
- `GET /concerts` - list all concerts
- `POST /concerts` - create concert (admin only)
- `DELETE /concerts/:id` - delete concert (admin only)

**Reservations** (need to be logged in)
- `POST /reservations` - reserve a seat
- `DELETE /reservations/:id` - cancel reservation
- `GET /reservations/history` - my reservations
- `GET /reservations/all` - all reservations (admin only)

## Bonus: Performance

**What's already in the project:**
- The `@@unique([userId, concertId])` constraint in Prisma automatically creates a composite index on the reservations table, so lookups for "did this user already book this concert?" are fast
- Passwords are hashed with bcrypt (cost factor 10) which balances security and speed
- Frontend uses `Promise.all` to fetch concerts and reservations in parallel instead of waiting one by one

**What I'd add if traffic increases:**
- Use Redis to cache the concert list since it doesn't change that often, and invalidate when admin creates or deletes
- Add pagination on concert list and history endpoints instead of loading everything at once
- Put static assets behind a CDN (Vercel does this for Next.js out of the box)
- Use connection pooling (like PgBouncer) so the database doesn't get overwhelmed with connections

## Bonus: Concurrency

**What's already in the project:**
- The `@@unique([userId, concertId])` constraint at the database level prevents the same user from booking the same concert twice, even if two requests come in at the same time. Prisma throws a P2002 error and the backend catches it and returns a ConflictException
- The backend checks `concert._count.reservations >= concert.totalSeats` before allowing a new booking

**The problem that's not fully solved yet:**
What happens when 1,000 people try to book the last 10 seats at the exact same time? The current code checks how many reservations exist, then creates a new one if there's room. Two requests could both see "9 out of 10 booked" and both go through, ending up with 11 bookings for 10 seats.

**How I'd fix it:**
1. Wrap the check + insert in a database transaction with `SELECT ... FOR UPDATE` on the concert row. This locks the row so only one request can read the count and insert at a time
2. Another option is optimistic locking - add a version number to the concert, check it before inserting, and retry if someone else got there first
3. For even higher scale, use a message queue (like BullMQ with Redis) to serialize booking requests per concert so they get processed one at a time

## Note

The Figma design doesn't have a page for user personal history, but Task 4 under User Features mentions "Personal History: View a private list of their own reservation history." So I went ahead and added it using the same table layout as the admin history page. Also, the "Switch to User" and "Switch to Admin" buttons in the sidebar aren't specified in Figma either, so I made them redirect to the user login and admin login pages respectively.
