# Longevity Dashboard

## Current State
- Full-stack app with Motoko backend and React frontend
- Top header with logo + tab navigation (Dashboard, Ernährung, Schlaf, Bewegung, Stress, Fasten, Routinen)
- Dashboard shows score ring, category tiles (read-only status), DNA helix panel
- Category components (Ernaehrung, Schlaf, Bewegung, Stress, Intervallfasten, Routinen) are separate pages
- Backend stores data globally (not per user/principal)
- No authentication

## Requested Changes (Diff)

### Add
- Internet Identity login screen: unauthenticated users see a branded login page before accessing the dashboard
- Per-user data isolation: all backend operations scoped to the caller's principal
- Clickable dashboard tiles: each category tile opens the corresponding input form/page
- Back navigation from category pages back to Dashboard (no top menu needed)

### Modify
- Remove the entire top header/menu bar (logo, date, tab navigation)
- Dashboard category tiles become interactive buttons that navigate to category pages
- Backend: all storage maps keyed by principal so each user has their own data
- App routing: state-based navigation controlled from Dashboard tile clicks

### Remove
- Top header with logo and navigation tabs
- Global (shared) data storage in backend

## Implementation Plan
1. Add authorization component for Internet Identity login
2. Regenerate backend with per-principal data storage (Map<Principal, Map<Nat, Entry>>)
3. Remove header/nav from App.tsx; navigation driven by Dashboard tile clicks
4. Dashboard tiles become clickable cards that set the active view
5. Each category view has a back button to return to Dashboard
6. Login screen shown when not authenticated; dashboard shown when authenticated
7. Logout button accessible from dashboard (subtle, e.g. in footer or top-right corner)
