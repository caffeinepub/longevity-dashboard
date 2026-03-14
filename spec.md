# Longevity Dashboard

## Current State
Dark mode health dashboard with 6 tracking categories (Ernährung, Schlaf, Bewegung, Stress, Intervallfasten, Routinen) plus an animated DNA helix background. User authentication via Internet Identity. Each user has an isolated dashboard. Nutrition tracks protein (calculated from body weight at 1.8g/kg) and vegetables (400g goal). Routinen support optional notes.

## Requested Changes (Diff)

### Add
- `WeightEntry` type in backend: `{ id: Nat, weightKg: Float, timestamp: Int }`
- `addWeightEntry(weightKg: Float): async Nat` backend function
- `getWeightHistory(): async [WeightEntry]` backend function (returns all entries sorted by timestamp)
- `Profil` frontend view (new tab navigated from dashboard tile)
- Profile view contains:
  - Name field (saved to existing UserProfile)
  - Weight entry input (kg) with save button
  - Weight history chart showing the last 30 entries as a line chart (date on x-axis, weight on y-axis)
  - Current protein target displayed (weight × 1.8g)
- Dashboard tile for "Profil" to navigate to the new view

### Modify
- `App.tsx`: add `"profil"` to ViewId union and render `<Profil onBack={handleBack} />`
- Dashboard: add a Profil tile alongside the existing 6 category tiles

### Remove
- Nothing removed

## Implementation Plan
1. Update `backend/main.mo` to add WeightEntry type, storage, addWeightEntry, and getWeightHistory functions
2. Update `backend.d.ts` to reflect new backend API
3. Create `src/frontend/src/components/Profil.tsx` with name field, weight input, weight history chart
4. Update `App.tsx` to add profil route
5. Update `Dashboard.tsx` to include Profil tile
