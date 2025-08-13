
# Virtual Event Management Backend — README

A production-minded Node.js/Express backend for a virtual event platform. It supports **secure user auth** (bcrypt + JWT), **event scheduling** (create/update/delete/list), and **participant management** (register, view my registrations). You can run it **entirely in-memory** (zero external deps) or switch to a **database** (MongoDB) with a single config flag. On successful **user registration**, the system sends a confirmation email.

---

## ✨ Features

* **Auth**: Register/Login with hashed passwords (bcrypt), stateless sessions (JWT), refresh token option.
* **Events**: Create, update, delete, list, get by id.
* **Participants**: Register for events, list my registrations, cancel my registration.
* **Access control**:

  * Auth required for all event mutating actions.
  * Optional roles: `user` (default) and `organizer` (can manage events).
* **Storage**:

  * **In-memory** (default) for quick start and tests.
  * **MongoDB** optional (toggle with `DATA_BACKEND=mongo`).
* **Email**: Nodemailer SMTP (use Mailtrap/Ethereal for dev).
* **DX & Ops**:

  * Input validation (express-validator)
  * Centralized error handling + consistent JSON errors
  * Security headers (helmet), CORS, rate limiting
  * Ready-to-ship **Dockerfile** & **docker-compose**
  * Minimal **Jest** tests + seed script
  * Health & readiness probes

---

## 🧭 API Overview

Base URL: `http://localhost:3000/api`

| Method | Path                   | Auth          | Description                        |
| -----: | ---------------------- | ------------- | ---------------------------------- |
|   POST | `/register`            | ❌             | Create user + send email           |
|   POST | `/login`               | ❌             | Login → JWT access token           |
|    GET | `/me`                  | ✅             | Get current user profile           |
|   POST | `/events`              | ✅ (organizer) | Create event                       |
|    GET | `/events`              | ❌             | List events                        |
|    GET | `/events/:id`          | ❌             | Get event by id                    |
|    PUT | `/events/:id`          | ✅ (organizer) | Update event                       |
| DELETE | `/events/:id`          | ✅ (organizer) | Delete event                       |
|   POST | `/events/:id/register` | ✅             | Register current user for event    |
| DELETE | `/events/:id/register` | ✅             | Cancel registration (current user) |
|    GET | `/registrations/me`    | ✅             | List my event registrations        |
|    GET | `/health`              | ❌             | Liveness probe                     |
|    GET | `/ready`               | ❌             | Readiness probe                    |

---

## 🏗️ Project Structure

```
.
├─ src/
│  ├─ app.js
│  ├─ server.js
│  ├─ config/
│  │   ├─ env.js
│  │   └─ db.js
│  ├─ data/
│  │   ├─ memoryStore.js        # in-memory repositories
│  │   └─ mongoModels.js        # optional MongoDB models
│  ├─ email/
│  │   └─ mailer.js
│  ├─ middlewares/
│  │   ├─ auth.js
│  │   ├─ errors.js
│  │   ├─ rateLimit.js
│  │   └─ roles.js
│  ├─ routes/
│  │   ├─ auth.routes.js
│  │   ├─ event.routes.js
│  │   └─ registration.routes.js
│  ├─ services/
│  │   ├─ auth.service.js
│  │   ├─ event.service.js
│  │   └─ registration.service.js
│  └─ validators/
│      ├─ auth.validators.js
│      └─ event.validators.js
├─ tests/
│  └─ basic.spec.js
├─ .env.example
├─ Dockerfile
├─ docker-compose.yml
├─ Makefile
├─ package.json
└─ README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` → `.env.local` and customize:

```ini
# App
PORT=3000
NODE_ENV=development

# Storage: memory | mongo
DATA_BACKEND=memory

# JWT
JWT_SECRET=replace_me_with_strong_secret
JWT_EXPIRES=1d
JWT_REFRESH_EXPIRES=7d

# Email (Mailtrap example)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM="Events <no-reply@events.local>"

# Mongo (only if DATA_BACKEND=mongo)
MONGO_URI=mongodb://localhost:27017/virtual_events
```

> **Security tip**: Never commit real secrets. Use a secrets manager for production.

---

## 🚀 Quick Start (In-Memory Mode — zero deps)

```bash
# 1) Install deps
npm install

# 2) Prepare env
cp .env.example .env.local  # edit as needed; keep DATA_BACKEND=memory

# 3) Run
npm run dev  # or: npm start

# 4) Health check
curl -s http://localhost:3000/api/health
```

---

## 🗄️ Quick Start (MongoDB Mode)

```bash
# 1) Run Mongo (docker)
docker run -d --name mongo -p 27017:27017 mongo:7

# 2) Configure env
cp .env.example .env.local
# set DATA_BACKEND=mongo and MONGO_URI=mongodb://localhost:27017/virtual_events

# 3) Start app
npm run dev
```

---

## 🐳 Docker & Compose

**Dockerfile** and **docker-compose.yml** included:

```bash
# Build & run
docker build -t virtual-events:latest .
docker run -p 3000:3000 --env-file .env.local virtual-events:latest

# Or with compose (includes Mongo service)
docker compose up --build
```

---

## 🧪 Testing

```bash
npm test
```

---

## 🔐 Auth Flow

1. `POST /register` → creates user, sends confirmation email.
2. `POST /login` → returns `accessToken` (JWT).
3. Attach header on protected routes:

   ```
   Authorization: Bearer <accessToken>
   ```

**Roles**:

* `user` (default): can register/unregister for events; view own registrations.
* `organizer`: can create/update/delete events.

> Assign role `organizer` by seeding or manual DB update (for memory mode, see comments in `memoryStore.js`).

---

## 📬 Email Flow

* Uses Nodemailer SMTP.
* For dev: use **Mailtrap** or **Ethereal** (auto-generated test inbox).
* On successful `POST /register`, user receives a confirmation message.

---

## 🧩 API Examples (cURL)

### Register

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "omkar",
    "email": "omkar@example.com",
    "password": "StrongP@ssw0rd",
    "confirmPassword": "StrongP@ssw0rd"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "omkar@example.com", "password": "StrongP@ssw0rd" }'
# => { "accessToken": "..." }
```

### Create Event (organizer only)

```bash
ACCESS=... # paste JWT
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $ACCESS" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DevOps Summit",
    "description": "Infra as Code & Platforms",
    "date": "2025-10-21",
    "time": "14:00",
    "capacity": 200
  }'
```

### Register for Event

```bash
curl -X POST http://localhost:3000/api/events/<eventId>/register \
  -H "Authorization: Bearer $ACCESS"
```

### Cancel Registration

```bash
curl -X DELETE http://localhost:3000/api/events/<eventId>/register \
  -H "Authorization: Bearer $ACCESS"
```

### List My Registrations

```bash
curl -X GET http://localhost:3000/api/registrations/me \
  -H "Authorization: Bearer $ACCESS"
```

---

## 🧠 Data Model (In-Memory)

```js
// src/data/memoryStore.js
const { randomUUID } = require('crypto');

const memory = {
  users: new Map(),      // id -> { id, username, email, passwordHash, role }
  events: new Map(),     // id -> { id, name, description, date, time, capacity, participants: Set<userId> }
  registrations: new Map() // userId -> Set<eventId>
};

module.exports = {
  createUser: (u) => { const id = randomUUID(); memory.users.set(id, { id, role: 'user', ...u }); return memory.users.get(id); },
  getUserByEmail: (email) => [...memory.users.values()].find(u => u.email === email) || null,
  getUserById: (id) => memory.users.get(id) || null,

  createEvent: (e) => { const id = randomUUID(); memory.events.set(id, { id, participants: new Set(), ...e }); return memory.events.get(id); },
  updateEvent: (id, patch) => { const ev = memory.events.get(id); if (!ev) return null; Object.assign(ev, patch); return ev; },
  deleteEvent: (id) => memory.events.delete(id),
  listEvents: () => [...memory.events.values()],
  getEvent: (id) => memory.events.get(id) || null,

  register: (userId, eventId) => {
    const ev = memory.events.get(eventId); if (!ev) return { error: 'NotFound' };
    if (ev.capacity && ev.participants.size >= ev.capacity) return { error: 'Full' };
    if (ev.participants.has(userId)) return { error: 'Already' };
    ev.participants.add(userId);
    if (!memory.registrations.has(userId)) memory.registrations.set(userId, new Set());
    memory.registrations.get(userId).add(eventId);
    return { ok: true, event: ev };
  },

  unregister: (userId, eventId) => {
    const ev = memory.events.get(eventId); if (!ev) return { error: 'NotFound' };
    ev.participants.delete(userId);
    if (memory.registrations.has(userId)) memory.registrations.get(userId).delete(eventId);
    return { ok: true, event: ev };
  },

  listMyRegistrations: (userId) => {
    const ids = memory.registrations.get(userId) || new Set();
    return [...ids].map(id => memory.events.get(id)).filter(Boolean);
  },
};
```

> **MongoDB** models mirror these fields (see `src/data/mongoModels.js`) and services use a repository interface to remain storage-agnostic.

---

## 🧰 Key Middlewares & Services (Highlights)

### Auth Middleware (`src/middlewares/auth.js`)

* Verifies JWT in `Authorization: Bearer <token>`.
* Attaches `req.user = { id, role, email }`.

### Role Guard (`src/middlewares/roles.js`)

```js
module.exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
  next();
};
```

### Rate Limiting (`src/middlewares/rateLimit.js`)

* 100 req / 15 min per IP for auth routes; adjustable via env.

### Validators (`src/validators/*.js`)

* `registerValidator`: email format, password length, confirm match.
* `eventValidator`: ISO date/time, capacity integer ≥ 0.

---

## 🧯 Error Handling

All errors return a consistent JSON structure:

```json
{ "message": "Error summary", "details": [ ...optional array... ] }
```

* 400: Validation / bad input
* 401: Unauthorized (missing/invalid token)
* 403: Forbidden (role)
* 404: Not found
* 409: Conflict (duplicate, already registered)
* 429: Too many requests
* 500: Internal server error

---

## 🧱 Production Hardening Checklist

* [ ] Use **strong JWT secret**; rotate regularly.
* [ ] HTTPS termination (at LB/reverse proxy).
* [ ] Enable **helmet**, **CORS** allowlist, **rate limits**.
* [ ] Centralized logging (JSON logs) + correlation IDs.
* [ ] Health (`/api/health`) & readiness (`/api/ready`) wired to orchestration.
* [ ] CI/CD: lint, test, build, container scan, SAST.
* [ ] Backup strategy (if DB mode), seed scripts separate from runtime.
* [ ] Observability hooks (Prometheus metrics endpoint).
* [ ] Use **Mail provider** (SES, SendGrid) with DKIM/SPF for prod email.

---

## 🧾 Example `.http` (VSCode REST Client)

```http
### Register
POST http://localhost:3000/api/register
Content-Type: application/json

{
  "username": "omkar",
  "email": "omkar@example.com",
  "password": "StrongP@ssw0rd",
  "confirmPassword": "StrongP@ssw0rd"
}

### Login
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "email": "omkar@example.com",
  "password": "StrongP@ssw0rd"
}
```

---

## 🧪 Seed Organizer (Dev)

In-memory: within `memoryStore.js`, after createUser, set `role: 'organizer'` for your account or add a `scripts/seed.js`:

```bash
node scripts/seed.js
```

---

## 🔄 Makefile (Convenience)

```
.PHONY: dev test docker-up docker-down lint

dev:
\tnpm run dev

test:
\tnpm test

docker-up:
\tdocker compose up --build

docker-down:
\tdocker compose down -v

lint:
\tnpx eslint .
```

---

## ❓ Troubleshooting

* **401 Unauthorized**: Check `Authorization` header and token expiry.
* **403 Forbidden**: You’re not an `organizer` for event mutations.
* **429 Too Many Requests**: Hit rate limit; wait or adjust env.
* **Email not delivered**: Verify SMTP creds; for dev, prefer Mailtrap/Ethereal.
* **Mongo mode not connecting**: Confirm `MONGO_URI` and that container/port is reachable.

---

## 📄 License

MIT — do whatever you want, just don’t blame us if it breaks in prod. 😉

---

## 👋 Contributing

PRs welcome! Please include tests and follow the existing code style.

---

### Final Notes for DevOps-minded Prod Runs

* Package as OCI image with a **non-root** user.
* Expose only port 3000, run behind reverse proxy (Nginx/Traefik).
* Configure resource limits (CPU/mem) and autoscaling (HPA).
* Use **rolling** or **blue/green** deploys. Persist nothing when in-memory!
* For Mongo, prefer managed service or replica set with TLS and SCRAM auth.



---
const moment = require('moment');
if (!moment(date, "YYYY-MM-DD", true).isValid()) {
  return res.status(400).json({ message: "Invalid date format" });
}
if (!moment(time, "HH:mm", true).isValid()) {
  return res.status(400).json({ message: "Invalid time format" });
}
