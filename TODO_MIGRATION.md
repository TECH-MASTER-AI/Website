# Migration Roadmap: Separated & Angular

## ✅ Phase 1: Separation (Completed)
- [x] Create `backend`, `frontend-react`, and `frontend` (Angular) directories.
- [x] Move Express server and Supabase logic to `/backend`.
- [x] Update backend imports and create dedicated `backend/package.json`.
- [x] Move existing React app to `/frontend-react` and clean up scripts.
- [x] Initialize **Angular 19** project in `/frontend`.
- [x] Distribute `.env` configuration to all three sub-projects.

## 🏗️ Phase 2: Angular Frontend Setup
- [ ] **Tailwind CSS Integration:** Install and configure Tailwind in `/frontend` to match React styling.
- [ ] **Shared Assets:** Move common images/icons from `frontend-react/public` to `frontend/public`.
- [ ] **Environment Mapping:** Map `VITE_` variables to Angular `environment.ts` or `process.env`.
- [ ] **Lucide Icons:** Setup `lucide-angular` to replace `lucide-react`.

## 🚀 Phase 3: Core Migration (React -> Angular)
- [ ] **Service Layer:** Create `ApiService` in Angular to handle communications with the `/backend`.
- [ ] **Auth Migration:** Port Supabase Auth logic to an Angular `AuthService` using Signals.
- [ ] **Layouts:** Recreate `Header`, `Footer`, and `StaticPageLayout` as Standalone Components.
- [ ] **Routing:** Map `react-router-dom` paths to `app.routes.ts`.

## 🧪 Phase 4: Validation & Deployment
- [ ] **Local Integration:** Verify Angular frontend can fetch data from the local Express server.
- [ ] **Vercel Setup:** Configure `frontend/vercel.json` for independent hosting.
- [ ] **Regression Testing:** Ensure `frontend-react` still builds and runs for reference.
