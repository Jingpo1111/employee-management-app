# Employee Management Platform

Modern employee management web application with role-based dashboards, employee CRUD, analytics, export tools, and a SaaS-style responsive UI.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Recharts
- Backend: Node.js, Express, TypeScript, Prisma ORM
- Database: PostgreSQL
- Auth: JWT with role-based API guards
- Public deploy target: Render Blueprint (`render.yaml`)

## Features

### Admin
- Secure login/logout
- Dashboard with KPI cards and analytics charts
- Employee directory with search, filter, sort, pagination
- Add, edit, delete employee records
- Employee detail view with attendance, tasks, and permissions
- Export directory to CSV or PDF
- Role and permission management surface

### Employee
- Personal dashboard
- Profile management
- Attendance history
- Task workspace
- Notifications/messages from admin

### UX/UI
- Responsive SaaS shell with icon sidebar
- Soft shadows, rounded cards, and spacious layout
- Dark/light mode toggle
- Loading, empty, and error states
- Keyboard-focus visibility and accessible labels

## Project Structure

```text
.
├── client
│   ├── scripts
│   │   └── patch-rollup.mjs
│   ├── src
│   │   ├── components
│   │   │   ├── charts
│   │   │   ├── layout
│   │   │   └── ui
│   │   ├── context
│   │   ├── lib
│   │   ├── pages
│   │   │   ├── admin
│   │   │   └── employee
│   │   ├── types
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── server
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   ├── prisma.config.ts
│   └── tsconfig.json
├── render.yaml
├── vercel.json
├── docker-compose.yml
└── package.json
```

## Local Development

1. Install dependencies:
   - `npm run setup`
2. Start PostgreSQL with Docker:
   - `docker compose up -d`
3. Create env file:
   - Copy `server/.env.example` to `server/.env`
4. Push schema and seed demo data:
   - `cd server`
   - `npx prisma db push`
   - `npm run seed`
5. Start the app from the repo root:
   - `npm run dev`
6. Open:
   - Frontend: `http://localhost:5173`
   - API: `http://localhost:4000/api/health`

## Public Deployment

This repo is prepared for a single-service Render deployment:
- One Render web service builds the frontend and backend together
- The Express server serves the built React app and the `/api/*` routes
- One Render Postgres database is provisioned from `render.yaml`

### Render steps

1. Push this repo to GitHub.
2. In Render, create a new Blueprint.
3. Point it at this repository.
4. Render reads `render.yaml` and provisions:
   - `employee-management-app`
   - `employee-management-db`
5. After the first deploy finishes, open the generated app URL.

### What the Blueprint does

- Installs root, server, and client dependencies
- Builds both frontend and backend
- Runs `prisma db push`
- Runs the idempotent seed script
- Starts the Express server

## Demo Credentials

- Admin: `admin@acmehr.com / Admin@123`
- Employee: `sokha.chan@acmehr.com / Employee@123`

## API Overview

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/dashboard`
- `GET /api/admin/employees`
- `GET /api/admin/employees/export?format=csv|pdf`
- `GET /api/admin/employees/:id`
- `POST /api/admin/employees`
- `PUT /api/admin/employees/:id`
- `PATCH /api/admin/employees/:id/permissions`
- `DELETE /api/admin/employees/:id`
- `GET /api/employee/dashboard`
- `GET /api/employee/profile`
- `PUT /api/employee/profile`
- `GET /api/employee/attendance`
- `GET /api/employee/tasks`
- `GET /api/employee/notifications`

## UX Notes

- Keep primary actions at the top right of dense admin screens.
- Reserve destructive actions for icon-only controls with extra spacing from edit actions.
- Surface analytics in summary cards first, then detailed charts.
- Limit employee self-service editing to safe personal fields.
- Use progressive disclosure: overview first, details and permissions deeper in the flow.

## Environment Notes

- `client/.env.example` defaults to `/api` for same-origin production deployment.
- `server/.env.example` supports local development and optional comma-separated `CLIENT_URL` values when you deploy frontend and backend separately.
- `client/scripts/patch-rollup.mjs` applies a WASM fallback for Rollup in Windows environments where native binaries are blocked by policy.
