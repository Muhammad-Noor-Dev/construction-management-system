# Frontend structure

The monolithic frontend has been split into reusable components and independent page files.

- `src/main.jsx` — React entry point
- `src/App.jsx` — application shell and page selection
- `src/config/modules.js` — module definitions and RBAC permissions
- `src/lib/api.js` — API client helpers
- `src/components/` — shared login, navigation, CRUD, modal and UI components
- `src/pages/` — one page component per CMS module

Every page remains connected to the existing backend endpoints and retains role-based access, loading/error handling, search, create, edit and delete behavior where permitted.
