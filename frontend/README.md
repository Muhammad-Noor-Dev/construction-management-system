# HR Builders CMS Frontend

React + Vite frontend for the HR Builders Construction Management System API.

## Run

1. Start PostgreSQL and the backend on port 5000.
2. Copy `.env.example` to `.env` if you need a different API URL.
3. Run `npm install`.
4. Run `npm run dev`.

The frontend uses the backend's JWT login and sends `Authorization: Bearer <token>` on protected requests.

## Updated workflows

- Project editing validates required fields, shows a saving state, and refreshes project data after a successful update.
- Client receipts list only invoices with an outstanding balance and provide a create-invoice path if none are available.
- Finance supports recording both client receipts and contractor payments.
- Warehouse pages show explicit loading/error/not-found states. Stock receipt, material request/approval, damage, waste, and movement history are grouped in the warehouse workspace.
- Site pages support requesting material from a source warehouse and recording site-level consumption values.
- Reports include visual project, financial, inventory and payroll summaries, with detail tables.
- Admins can create system login accounts with an appropriate role. Employee records and login users are separate in the supplied database schema, so creating a user does not establish a foreign-key relationship to the employee record.

## Roles

The UI reflects the authenticated user's role, but the backend remains the authoritative security boundary. Backend routes may still reject requests when permissions are insufficient.

## Notes

This is a frontend-only patch. The backend and database were not changed. All 41 JavaScript/JSX files passed syntax transpilation, but a full production build and end-to-end runtime test could not be completed in this environment. See `FRONTEND_PATCH_NOTES.md` for details.
