# BookOrbit 📚

![React](https://img.shields.io/badge/React-v19-61dafb?style=flat-square&logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-v7-ca4245?style=flat-square&logo=react-router&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Build](https://img.shields.io/badge/Build-Passing-22c55e?style=flat-square&logo=github-actions)

BookOrbit is a web platform that lets university students lend and borrow used textbooks from each other. The idea came from a simple frustration — buying a textbook for one semester, using it for a few months, then watching it collect dust on a shelf. This platform tries to fix that.

Students can list the books they own, browse what others are offering, and send borrowing requests directly. No middleman, no cost, just students helping students.

---

## Table of Contents

- [How it works](#how-it-works)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database schema](#database-schema)
- [User flow](#user-flow)
- [Roadmap](#roadmap)

---

## How it works

The frontend is a React SPA that talks to a REST API backend. Authentication is handled with JWT — an access token for requests and a refresh token to keep the session alive without forcing the user to re-login every hour.

Accounts are restricted to university email addresses. After registering, the student receives a verification link. Once confirmed, the account sits in a "pending" state until an admin approves it. This keeps the platform exclusive to actual students.

The core loop is simple:
1. A student registers a physical copy of a book they own
2. They list it for lending — it shows up in the lending market
3. Another student finds it and sends a borrowing request
4. The owner accepts or rejects, and they sort out the handover themselves

```
Browser (React)
     │
     │  HTTP / REST
     ▼
  API Server
     │
     ├── Auth & sessions
     ├── Student accounts
     ├── Book catalog
     ├── Physical copies (BookCopy)
     ├── Lending market
     └── Borrowing requests
     │
     ▼
  Database
```

---

## Features

**Authentication & accounts**
- JWT-based login with access and refresh tokens
- University email verification
- Password reset via email link
- Profile management (major, contact info, avatar)

**Books**
- A shared catalog of book records (title, author, ISBN, category)
- Students can suggest new books; admins approve or reject
- Each book in the catalog can have multiple physical copies owned by different students

**Lending market**
- Students list their physical copies for others to borrow
- Anyone can browse the market and filter by title, category, or availability
- Borrowing requests include an optional message to the owner

**Borrowing requests**
- Owners can accept or reject incoming requests
- Borrowers can cancel their own requests
- Status tracking: pending → accepted / rejected / cancelled

**Admin panel**
- Approve, reject, or put accounts back to pending
- Ban and unban students
- Approve or reject book suggestions

---

## Tech stack

| | |
|---|---|
| UI framework | React v19 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v3.4 + PostCSS + Autoprefixer |
| Animations | Framer Motion |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Testing | Testing Library |

---

## Project structure

```
src/
├── assets/
├── components/
│   ├── ui/            # buttons, inputs, modals, cards
│   ├── layout/        # header, footer, sidebar
│   └── shared/        # things used across multiple pages
├── pages/
│   ├── auth/          # login, register, verify email
│   ├── books/         # catalog, book detail
│   ├── lending/       # lending market
│   ├── profile/       # student profile
│   └── admin/         # admin dashboard
├── hooks/
├── context/           # AuthContext, etc.
├── services/          # API calls
├── utils/
├── routes/            # route definitions and protected routes
└── main.jsx
```

---

## Getting started

You'll need Node.js 20+ and npm 10+.

```bash
git clone https://github.com/your-username/bookorbit.git
cd bookorbit
npm install
cp .env.example .env
```

Open `.env` and fill in the values (see the next section), then:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

**Other scripts:**

```bash
npm run build        # production build
npm run preview      # preview the production build locally
npm run test         # run tests
npm run lint         # lint the codebase
```

---

## Environment variables

```env
# API
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Auth token keys (used for localStorage)
VITE_JWT_ACCESS_TOKEN_KEY=bookorbit_access
VITE_JWT_REFRESH_TOKEN_KEY=bookorbit_refresh

# Media
VITE_MEDIA_BASE_URL=http://localhost:3000

# App
VITE_APP_ENV=development
```

Don't commit your actual `.env` file. The `.env.example` in the repo has all the keys with empty values — use that as a reference.

---

## Database schema

Seven models cover everything the platform needs.

**User** — the account itself

```
id            UUID
email         string, unique
password_hash string
status        enum: pending | approved | activated | banned
role          enum: student | admin
created_at    timestamp
updated_at    timestamp
```

**Profile** — linked 1:1 to a User

```
id          UUID
user_id     UUID → User
full_name   string
major       string
phone       string
avatar_url  string
bio         text
```

**Book** — a catalog record (not a physical copy)

```
id            UUID
title         string
author        string
isbn          string, unique
category      string
cover_url     string
status        enum: pending | available | rejected
submitted_by  UUID → User
created_at    timestamp
```

**BookCopy** — a physical copy owned by a student

```
id          UUID
book_id     UUID → Book
owner_id    UUID → User
condition   enum: new | good | fair | poor
notes       text
is_listed   boolean
created_at  timestamp
```

**LendingList** — a listed copy visible in the market

```
id          UUID
copy_id     UUID → BookCopy, unique
listed_by   UUID → User
listed_at   timestamp
is_active   boolean
```

**BorrowingRequest** — a request to borrow a listed copy

```
id            UUID
listing_id    UUID → LendingList
borrower_id   UUID → User
status        enum: pending | accepted | rejected | cancelled
message       text
requested_at  timestamp
responded_at  timestamp
```

**RefreshToken**

```
id          UUID
user_id     UUID → User
token       string, unique
expires_at  timestamp
created_at  timestamp
```

The key design decision here is the split between `Book` and `BookCopy`. The catalog (`Book`) is shared — everyone references the same record for, say, "Clean Code by Robert Martin." The physical copy is separate and tied to whoever owns it. This avoids duplicates and makes it easy to see how many copies of any given book are available at any time.

---

## User flow

### Registering and getting approved

A student fills out the form with their university email. They get a verification link, click it, and the account enters a pending state. An admin reviews it and either approves or rejects it. Once activated, the student has full access.

### Listing a book for lending

The student goes to their library and adds a book. They search for it in the catalog — if it's already there, they attach their physical copy to that record. If it's not in the catalog yet, they suggest it, and an admin approves the entry before it becomes searchable.

After adding the copy, they mark it as listed. It appears in the lending market for everyone to see.

### Borrowing a book

Another student finds it in the market and sends a borrowing request, optionally leaving a short message. The owner gets notified, looks at the request, and accepts or rejects it. If accepted, the two students coordinate the handover on their own — the platform just makes the match.

The borrower can cancel their request at any point before the owner responds, in case they found another copy or just changed their mind.

---

## Roadmap

Things I want to add, roughly in priority order.

**Near term**
- Real-time notifications so students don't have to refresh to see new requests
- In-app messaging between borrower and owner to coordinate pickup
- A rating system after each completed lending

**A bit further out**
- Better search and filtering — by major, semester, campus
- Multi-university support with proper data isolation
- Mobile app (likely React Native)

**Eventually**
- Map view showing available books near you
- Goodreads API integration to pull book metadata automatically
- Recommendations based on major and borrowing history

---

## Contributing

Fork the repo, create a branch, open a pull request. Sticking to [Conventional Commits](https://www.conventionalcommits.org/) for commit messages keeps the history clean and readable.

---

## License

MIT — see `LICENSE` for details.
