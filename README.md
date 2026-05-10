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
├── frontend/
│   └── src/
│       └── app/
│           ├── page.tsx                        Landing page — choose User or Admin
│           ├── layout.tsx
│           ├── globals.css
│           ├── favicon.ico
│           │
│           ├── login/
│           │   └── page.tsx                    User login
│           ├── register/
│           │   └── page.tsx                    User register
│           │
│           ├── user/
│           │   ├── page.tsx                    User dashboard — concert list, reserve/cancel
│           │   └── history/
│           │       └── page.tsx                User personal reservation history
│           │
│           ├── admin/
│           │   ├── page.tsx                    Admin dashboard — stats, concert list, create
│           │   ├── login/
│           │   │   └── page.tsx                Admin login
│           │   ├── register/
│           │   │   └── page.tsx                Admin register
│           │   └── history/
│           │       └── page.tsx                Admin audit log — all users' actions
│           │
│           ├── components/
│           │   ├── AdminSidebar.tsx
│           │   ├── UserSidebar.tsx
│           │   ├── AuthLayout.tsx
│           │   ├── AuthIcons.tsx
│           │   ├── InputField.tsx
│           │   ├── StatCards.tsx               Reserved/Cancelled/Total seats counters
│           │   ├── Toast.tsx                   Success/error notification
│           │   └── DeleteConfirmDialog.tsx     Confirm modal before deleting a concert
│           │
│           └── lib/
│               ├── axios.ts                    Axios instance with base URL + auth header
│               ├── auth.ts                     Token helpers (save, get, remove)
│               ├── concerts.ts                 All API call functions
│               └── useAuth.ts                  Auth guard hook — redirects if not logged in
│
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── dto/
│   │   │       └── auth.dto.ts
│   │   │
│   │   ├── concerts/
│   │   │   ├── concerts.controller.ts
│   │   │   ├── concerts.service.ts
│   │   │   ├── concerts.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-concert.dto.ts
│   │   │   │   └── update-concert.dto.ts
│   │   │   └── entities/
│   │   │       └── concert.entity.ts
│   │   │
│   │   ├── reservations/
│   │   │   ├── reservations.controller.ts
│   │   │   ├── reservations.service.ts
│   │   │   ├── reservations.module.ts
│   │   │   ├── dto/
│   │   │   │   └── reserve.dto.ts
│   │   │   └── entities/
│   │   │       └── reservation.entity.ts
│   │   │
│   │   └── prisma/
│   │       ├── prisma.service.ts
│   │       └── prisma.module.ts
│   │
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│           ├── 20260509162052_init/
│           ├── 20260510060034_add_name_to_user/
│           ├── 20260510085109_add_reservation_status/
│           ├── 20260510091256_soft_delete_concert/
│           └── 20260510094014_add_audit_log/
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
- Next.js 16.2.6 with App Router
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
- Auth: register with USER/ADMIN role, register with name, duplicate email rejection,
  login success, login with wrong user, login with wrong password
- Concert: create, create with minimum 1 seat, list active concerts only, list when empty,
  soft-delete (cancels all reservations + creates EVENT_DELETED audit logs),
  delete non-existent concert, delete already-deleted concert
- Reservation: book a seat, reactivate a previously cancelled reservation,
  duplicate booking rejection, book a deleted concert, book when fully booked,
  book the last available seat, cancel, cancel non-existent, cancel someone else's
  reservation (ForbiddenException), cancel already-cancelled reservation,
  get personal history, get all history (admin), get stats (admin)

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
- `PATCH /reservations/:id/cancel` - cancel reservation
- `GET /reservations/active` - my active reservations (used for showing Reserve/Cancel button state)
- `GET /reservations/history` - my full audit history (RESERVE, CANCEL, EVENT_DELETED)
- `GET /reservations/all` - all reservations history (admin only)
- `GET /reservations/stats` - total reserved/cancelled count (admin only)

## Bonus: Performance Optimization Strategy

## Performance Optimization

If the app grows massive and traffic spikes, here is how I would optimize it to keep things fast:

**1. Put static files on a CDN**
Images and other static assets shouldn't be served by our main server. Using a CDN (like Vercel's built-in CDN or Cloudflare) makes images load faster for users and saves our server's bandwidth for actual API logic.

**2. Cache heavy queries with Redis**
The concert list gets viewed thousands of times but rarely changes. Instead of querying Postgres every single time a user opens the app, we can save that list in Redis. The app will fetch it instantly from memory. We just need to clear the cache whenever an admin creates or deletes a concert.

**3. Add Database Indexes**
As the database gets bigger, searching takes longer. I'd make sure we have indexes on columns we filter by often (like `userId` when fetching history). This stops the database from scanning every single row just to find a few records.

**4. Pagination**
Never return thousands of records in one API call. It kills the server memory and slows down the frontend. I'd add pagination to the APIs to load data in small chunks, like 20 items at a time.

## Bonus: Concurrency

**What's already in the project:**
- The `@@unique([userId, concertId])` constraint at the database level prevents the same user from booking the same concert twice, even if two requests arrive simultaneously. Prisma throws a P2002 error and the backend catches it and returns a ConflictException.

If 1,000 people hit the "Book" button at the exact same millisecond for the last 10 seats, a standard `SELECT` then `INSERT` will fail. All 1,000 requests will see that 10 seats are available, resulting in massive overbooking.

Here is how I would handle this, from a basic approach to a production-ready system:

**1. The Database Approach (Pessimistic Locking)**
For standard traffic, we can solve this at the database level using a transaction with `SELECT ... FOR UPDATE`.
* **How it works:** When the first user tries to book, this command locks the row for that specific concert in Postgres. The other 999 requests have to wait in line. Once the first user finishes booking and the seat count drops to 9, the lock is released for the next person in line.
* **The downside:** It perfectly guarantees no overbooking, but if 1,000 people do this at once, the database will likely freeze or crash due to connection limits and lock contention.
*(Note: Optimistic locking with a version number is bad here, because 990 users will fail the version check and keep retrying, creating a retry storm).*

**2. The High-Traffic Approach (Redis + Message Queues)**
If we are building something like Ticketmaster where extreme traffic spikes are expected, I would not let those 1,000 requests hit Postgres directly.

* **Step 1: Redis Atomic Counter:** I would store the "available seats" in Redis. When 1,000 requests come in, a Redis Lua script checks the count and decrements it in one atomic operation. The first 10 get a "success", and the remaining 990 are instantly rejected. This protects Postgres entirely.
* **Step 2: Message Queue:** The 10 successful requests are immediately pushed to a Message Queue (like RabbitMQ or AWS SQS), and the frontend tells the user "Processing your booking...".
* **Step 3: Async Processing:** A background worker slowly picks up those 10 messages from the queue and safely writes the actual reservation records into Postgres without overwhelming the database.

## Design Decisions & System Logic

While implementing the requirements based on the provided Figma design, I made a few intentional architectural and UI decisions to handle edge cases and improve the overall User Experience (UX).

### UI & Figma Extensions
- **User Personal History Page:** The original Figma didn't specify a UI for the user's personal history. To fulfill the "Personal History" requirement, I implemented a dedicated page using a consistent table layout adapted from the Admin History design.
- **Role Switching Navigation:** I added "Switch to User" and "Switch to Admin" buttons in the sidebar. These redirect to the respective login pages, making it much easier to test the application across different roles.
- **Event Status Column:** I intentionally added an "Event Status" column to the history tables. If an admin deletes a concert, users who already booked a seat need to know exactly why their reservation changed. Instead of the record confusingly vanishing, it explicitly shows "Event Canceled" (determined by the `deletedAt` field). This keeps users informed and ensures the audit trail remains perfectly intact.

### Backend Logic & Edge Cases
- **Soft Deletion for Concerts:** Concerts are *never* hard-deleted from the database to prevent breaking relational data. When an admin deletes a concert, a single database transaction executes three actions safely:
  1. Sets the concert's `deletedAt` timestamp — hiding it from the main discovery listing but preserving the record so history logs still have a reference name.
  2. Automatically updates all `RESERVED` statuses for that specific concert to `CANCELLED`.
  3. Generates an `EVENT_DELETED` audit log entry for every affected user. This clarifies in their personal history that the event was canceled by the organizer, not by the user themselves.
- **Real-Time Updates (Polling):** The frontend polls the backend every 10 seconds to automatically refresh concert availability and reservation statuses, ensuring users see the latest seat counts without manually reloading the page.

### Audit Log Action Types
The system strictly tracks reservation events using three action types:
- `RESERVE` — A user successfully reserved a seat.
- `CANCEL` — A user manually canceled their own reservation.
- `EVENT_DELETED` — The reservation was auto-canceled because the admin deleted the concert.
