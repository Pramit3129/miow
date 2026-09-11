# Aven — lending UI prototype

A frontend-only React and TypeScript prototype for a loan application workspace.

## Preview

```sh
npm install
npm run dev
```

Open the local address shown in the terminal. The initial view is the broker dashboard. Use the role switcher in the header to explore the borrower experience.

## Included screens

- Broker and borrower dashboards
- Searchable application list and application review workspace
- Configurable form editor with field settings and borrower preview
- Guided borrower application and simulated document uploads
- Document verification, replacement requests, and rejection dialogs
- Editable analysis, reports, and proposals
- Notifications, activity, profile, and mock authentication screens
- Responsive navigation and loading states

All data is fictional. Forms, filenames, document states, and report edits are stored in browser localStorage. No real authentication, file storage, lending decisions, AI, or email services are implemented.

## Checks

```sh
npx tsc --noEmit
npm run build
```
