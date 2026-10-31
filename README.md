# DeesOps Frontend

React + TypeScript single-page app for **DeesOps**, a multi-tenant B2B project management platform. It talks to the Laravel API in the `backend/` folder.

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19 (TypeScript, `strict: true`) |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Global state | Redux Toolkit |
| Data fetching and caching | RTK Query |
| Routing | React Router |
| Real-time (planned) | Laravel Echo + Reverb |
| Drag and drop (planned) | `@hello-pangea/dnd` |

## Features

- **Workspace registration:** creates a company workspace and its first admin.
- **Workspace login:** sign in with workspace domain, email, and password.
- **Logout:** revokes the token on the server, clears Redux state, and resets the RTK Query cache so the next user never sees the previous user's data.
- **Route guards:** `ProtectedRoute` for signed-in pages and `GuestRoute` for login and register.
- **Centralized 401 handling:** an expired or revoked token logs the user out automatically.
- **Laravel error parsing:** 422 validation errors are shown under the matching form fields.

## Authentication model

The access token is kept **only in Redux memory**, never in `localStorage` or cookies. This means nothing persisted is available for XSS to steal, but **refreshing the page logs the user out**. The only value saved in `localStorage` is the last workspace domain, which is not sensitive.

A refresh-token flow (httpOnly cookie) is on the roadmap to keep sessions alive across reloads.

## Getting started

### Requirements

- Node.js 20+
- The DeesOps API running (see `backend/README.md`)

### Installation

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`. The API's CORS config must allow this origin. Restart Vite after changing `.env`.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  app/
    store.ts            Redux store
    hooks.ts            Typed useAppDispatch / useAppSelector
  services/
    baseApi.ts          RTK Query base API (auth header, 401 handling)
  features/
    auth/
      authSlice.ts      Token and user state
      authApi.ts        login, register, logout endpoints
      useLogout.ts      Logout hook
      LoginPage.tsx
      RegisterPage.tsx
      ProtectedRoute.tsx
      GuestRoute.tsx
  components/
    Field.tsx           Labeled input with error message
  lib/
    errors.ts           Laravel 422 error parser
  pages/
    Dashboard.tsx
  types/
    index.ts            Role, User, AuthPayload
  App.tsx
  main.tsx
```

Each feature owns its slice, endpoints, and pages. New endpoints are added with `baseApi.injectEndpoints` so the API layer stays split by feature.

## Roles

| Role | Access |
|---|---|
| `viewer` | Read-only |
| `developer` | Viewer + move tasks between columns |
| `manager` | Developer + create, edit, delete projects and tasks |
| `admin` | Manager + manage users and view audit logs |

Role checks in the UI only hide or disable controls. The Laravel Policies are the real enforcement.

## Roadmap

- [x] Redux store and typed hooks
- [x] RTK Query base API with auth header and 401 handling
- [x] Login, register, and logout
- [x] Protected and guest routes
- [ ] Refresh-token bootstrap (stay logged in across reloads)
- [ ] App layout (sidebar, header, workspace menu)
- [ ] Projects list and CRUD
- [ ] Kanban board with drag and drop and optimistic updates
- [ ] Real-time sync with Laravel Echo
- [ ] Team and invitations page (admin)
- [ ] Audit log dashboard (admin)

## Tooling notes

This project was created from the Vite React + TypeScript template. The React Compiler is not enabled, and ESLint uses the template's defaults. To enable type-aware lint rules later, switch `tseslint.configs.recommended` to `recommendedTypeChecked` (or `strictTypeChecked`) in `eslint.config.js` and point `parserOptions.project` at `tsconfig.node.json` and `tsconfig.app.json`.
