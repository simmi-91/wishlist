# Wishlist Frontend

React + Vite + TypeScript frontend for the wishlist service. The app will list, create, edit, delete, and toggle wishes; support rich text descriptions with Quill; manage images; and authenticate all API calls with Google ID tokens. Data fetching will use @tanstack/react-query.

## Stack & tooling

- React 19, Vite, TypeScript
- @tanstack/react-router (routing), @tanstack/react-query (data)
- Quill for rich text (planned)
- REST API client with bearer auth (planned)
- ESLint + TypeScript project refs (build + lint)

## Running the app

```bash
npm install
npm run dev
```

Other scripts:

- `npm run build` – type-check then bundle
- `npm run preview` – preview the production build
- `npm run lint` – lint all sources

## Environment

Create `.env` with:

```
VITE_API_BASE_URL=<backend-url>
VITE_GOOGLE_CLIENT_ID=<gis-client-id>
```

## Planned structure

- `src/providers/` – `AppProviders` wrapping Query Client, Auth, Router
- `src/auth/` – Google Identity Services init, `AuthProvider`, `useAuth`
- `src/api/` – `client.ts` for base HTTP with token, `wishes.ts` endpoints
- `src/types/` – shared models (wish, image, payloads)
- `src/features/wishes/`
  - `hooks/` – React Query hooks for list/create/update/delete/toggle/image ops
  - `components/` – `WishList`, `WishCard`, `WishForm`, image controls
  - `utils/` – sorting, mapping API ↔ view models
- `src/components/` – shared UI (Button, Modal, Toast, Spinner)
- `src/styles/` – global styles/tokens
- `src/lib/` – cross-cutting helpers (e.g., DOMPurify wrapper)

## Implementation roadmap

1. Baseline providers (`AppProviders`) wiring Query, Auth, Router.
2. Google ID token auth: GIS loader/init, `AuthProvider`, `useAuth`, `getToken`.
3. API client: base URL, bearer token, 401 handling; wish endpoints (list, create, update, delete, toggle, image ops).
4. Types: wish and image metadata, request payloads.
5. React Query hooks for wishes (queries + mutations with invalidation/optimistic updates).
6. Feature components: list/cards, edit mode, Quill-based form, image controls.
7. Rich text via Quill with sanitized render.
8. Create/delete flows and confirmations.
9. UX polish: loading/error states, toasts, responsive layout.
10. Testing: component hooks/cards/forms with mocks (MSW), auth token mocking.

## Todo snapshot

- ✅ bootstrap-app
- ⬜ auth-google
- ⬜ api-client
- ⬜ state-query
- ⬜ ui-cards
- ⬜ edit-form
- ⬜ create-delete
- ⬜ images
- ⬜ ux-polish
- ⬜ tests
