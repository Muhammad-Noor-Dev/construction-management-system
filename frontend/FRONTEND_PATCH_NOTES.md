# HR Builders CMS — Frontend patch notes

This is a frontend-only patch. Backend and database files were not changed.

## Updates in this revision
- Fixed project edit flow: form values reset when opening a different project, validates required values and date order, shows saving state, awaits data refresh, and no longer opens the completion editor after saving project details.
- Fixed project completion refresh so the updated percentage is fetched again after saving.
- Improved client receipts: only invoices with an outstanding balance are selectable; unpaid balance is shown clearly; the user can create an invoice when none is outstanding; payment history refreshes after saving.
- Added a contractor-payment action in the Finance workspace, with refresh after saving.
- Fixed warehouse detail loading states and added readable unavailable/not-found states instead of an empty page.
- Improved inventory workflows: show available stock in material requests, validate quantities before submitting, support requesting stock for a site from its site workspace, and distinguish site consumption records from warehouse stock movements.
- Added site material-consumption create/update UI using existing endpoints and schema fields.
- Added report tabs with graphical project status, budget-vs-actual, monthly cash-flow and stock-level visualizations alongside detailed tables.
- Added Admin-only system account creation from Administration and employee profiles. This uses the existing `/users` endpoint and seeded role IDs. The current schema does **not** contain an employee-to-user foreign key, so the UI explicitly warns that a login is a separate user record and is not linked to the employee record.
- Kept the existing layout, visual language, navigation model, and backend workflows. No database or backend behavior was altered.

## Install and run
From this `frontend` folder:

```bash
npm install
npm run dev
```

The frontend expects the API at `http://localhost:5000/api` by default. To change it, copy `.env.example` to `.env` and set `VITE_API_URL`.

## Verification
- All 41 frontend JavaScript/JSX files passed TypeScript's syntax transpilation check.
- A full Vite production build could not be completed in this environment because dependency installation did not finish, so runtime/API behavior still needs testing against the user's running PostgreSQL-backed backend.
- `node_modules` is intentionally excluded from the ZIP.
