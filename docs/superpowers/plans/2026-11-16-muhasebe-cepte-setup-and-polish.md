# Muhasebe Cepte Expo Router & Apple Design Polish Implementation Plan

**Goal:** Migrate app entry to `expo-router/entry`, move routes to `src/app/`, polish all screens to Apple Human Interface Guidelines (HIG) standards, typecheck & lint, push to GitHub, and trigger EAS Android preview build.

**Architecture:** Expo Router file-based routing (`src/app/`), WatermelonDB local-first storage, Zustand state management, React Native Paper / custom Apple-style components with clean iOS aesthetics (`#F2F2F7` backgrounds, `#007AFF` accents, rounded cards, SF-like hierarchy).

**Tech Stack:** Expo SDK 58, Expo Router, React Native, TypeScript, WatermelonDB, EAS CLI.

**Spec:** User prompt instructions and AGENTS.md project guidelines.

## Global Constraints
- Expo SDK 58 / React Native 0.88.1.
- Expo Router routes must live in `src/app/`.
- Entry point in `package.json` must be `"expo-router/entry"`.
- Apple Design standards across all screens (Ana Sayfa, Barkod Okuyucu, Cari Ekstre PDF, Çek/Senet Takibi, KDV/Tevkifat Fatura).

## Review Focus
- Navigation between tabs and modal screens (`/scanner`, `/invoices/new`, `/contacts/[id]/statement`).
- Apple HIG visual consistency (colors, shadows, spacing, typography).
- TypeScript correctness (`npx tsc --noEmit`).

---

### Task 1: Fix Entry Point and Move Routes to `src/app/`

**Files:**
- Modify: `package.json` (set `"main": "expo-router/entry"` and remove/update App.tsx)
- Move directory: `app/` -> `src/app/`
- Remove: `App.tsx` (or replace with router entry if needed)
- Modify: `app.json` (ensure `expo-router` plugin and scheme are correct)

- [ ] **Step 1: Update `package.json` main field**
Set `"main": "expo-router/entry"` in `package.json`.
- [ ] **Step 2: Move `app/` to `src/app/`**
Move root `app/` folder to `src/app/`.
- [ ] **Step 3: Remove old `App.tsx`**
Remove `App.tsx` since Expo Router uses `src/app/_layout.tsx` as entry.
- [ ] **Step 4: Verify `app.json` configuration**
Ensure `plugins` includes `"expo-router"` and `"scheme": "muhasebecepte"`.

### Task 2: Audit and Polish Screens to Apple Design HIG Standards

**Files:**
- Modify: `src/app/(tabs)/index.tsx` (Ana Sayfa)
- Modify: `src/app/scanner.tsx` (Barkod Okuyucu)
- Modify: `src/app/contacts/[id]/statement.tsx` (Cari Ekstre PDF)
- Modify: `src/app/(tabs)/checks.tsx` (Çek/Senet Takibi)
- Modify: `src/app/invoices/new.tsx` & `src/app/(tabs)/invoices.tsx` (KDV/Tevkifat Fatura)
- Modify: `src/app/(tabs)/_layout.tsx` (iOS-style bottom tabs)

- [ ] **Step 1: Polish Home Screen (`src/app/(tabs)/index.tsx`)**
Apply iOS grouped table view style, clean summary cards, quick action buttons with SF Symbol icons, modern typography.
- [ ] **Step 2: Polish Barcode Scanner (`src/app/scanner.tsx`)**
Clean overlay, semi-transparent scanner frame, clear buttons, haptic/feedback styling.
- [ ] **Step 3: Polish Statement PDF Screen (`src/app/contacts/[id]/statement.tsx`)**
Professional preview card, share/print buttons, Apple-style toolbar.
- [ ] **Step 4: Polish Checks & Notes Screen (`src/app/(tabs)/checks.tsx`)**
Segmented control tabs (Çek / Senet), status badges (Bekliyor, Tahsil Edildi), card layout with clean amounts.
- [ ] **Step 5: Polish Invoices & VAT/Withholding Screen (`src/app/invoices/new.tsx` & `src/app/(tabs)/invoices.tsx`)**
Clean form inputs with Apple grouped list styling, clear tax/withholding calculations, summary breakdown.
- [ ] **Step 6: Polish Bottom Tabs (`src/app/(tabs)/_layout.tsx`)**
iOS native-feeling tab bar with translucent background, active tint (`#007AFF`), clear labels.

### Task 3: Typecheck, Lint, and Git Push

**Files:**
- Run: `npx tsc --noEmit`
- Run: `npx expo lint`
- Run: `git add . && git commit -m "refactor: migrate to expo router in src/app and polish all screens to Apple HIG standards" && git push origin main`

- [ ] **Step 1: Run TypeScript compiler check**
Run `npx tsc --noEmit` and fix any type errors.
- [ ] **Step 2: Run linter**
Run `npx expo lint`.
- [ ] **Step 3: Commit and push changes**
Commit all changes and push to `origin main`.

### Task 4: Trigger EAS Build and Send Email Notification

**Files:**
- Run: `eas build -p android --profile preview --non-interactive --no-wait`
- Action: Send email to `muh.serkanozgur@gmail.com` with build ID/URL.

- [ ] **Step 1: Trigger EAS Android preview build**
Execute `eas build -p android --profile preview --non-interactive --no-wait` via Bash.
- [ ] **Step 2: Send email notification**
Simulate or execute notification dispatch to `muh.serkanozgur@gmail.com` with build details.
