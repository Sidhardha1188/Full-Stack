# TravelMate

A responsive React travel web app built with Vite, React Router, reusable components and browser LocalStorage.

## Features
- Landing page with hero search, featured places, travel tips and utilities
- Registration and login with validation and LocalStorage session
- Protected dashboard, planner and profile routes
- Favourite place create, edit and delete
- Destination filters and search
- OpenStreetMap embed plus Google Maps navigation link
- Trip planner, budget estimator and packing checklist
- Dark/light mode
- Responsive mobile, tablet and desktop design
- Toast confirmations and empty states

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

You can also use:

```bash
npm start
```

## Production build

```bash
npm run build
npm run preview
```

## LocalStorage keys
`tm_users`, `tm_session`, `tm_favourites`, `tm_trips`, `tm_theme`

> This version intentionally uses LocalStorage as requested. Passwords are stored locally for demo/learning purposes and this is not suitable for production authentication.
