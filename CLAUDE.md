# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AMRIT Inventory-UI — an Angular 16 application for facility-level inventory management within the PSMRI AMRIT platform. Handles medicine dispensing, stock management (physical stock entry, adjustments, transfers, self-consumption), patient returns, indent/requisition management, and prescription (Rx) dispensing. This is the general-purpose inventory module (as opposed to HWC-Inventory-UI which is HWC-specific).

## Build & Development Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server on **port 4201** (`ng serve`) |
| `npm run build-dev` | AOT dev build (increased heap) |
| `npm run build-prod` | AOT production build (increased heap) |
| `npm run build-ci` | CI build (generates `environment.ci.ts` from template + env vars) |
| `npm run build-test` | AOT test build |
| `npm test` | Run tests (Karma + Jasmine) |
| `npm run lint` | ESLint |
| `npm run commit` | Commitizen conventional commit prompt |

## Architecture

### Module Structure

- **AppModule** — root module with hash-based routing (`useHash: true`)
- **CoreModule** — singleton services, guards, shared components, directives, pipes, `MaterialModule`
- **InventoryModule** (lazy-loaded at `/inventory`) — main inventory operations:
  - `dashboard` — inventory dashboard
  - `medicine-dispense` — dispensing medicines
  - `physical-stock-entry` — recording physical stock
  - `store-stock-adjustment` — stock adjustments
  - `store-stock-transfer` — inter-store transfers
  - `store-self-consumption` — facility self-consumption tracking
  - `patient-return` — handling returned medicines
  - `indent` — indent/requisition management
  - `reports` — inventory reports
  - `dynamic-print` — dynamic print layouts
  - `workarea` — main workspace
- **RxModule** (lazy-loaded at `/rx`) — prescription dispensing:
  - `rx-dashboard` — prescription dashboard
  - `rx-item-dispense` — dispensing prescribed items

### Routing

Root routes: `login`, `redirin`, `service`, `facility`, `loadStores`, `set-password`, `reset-password`, `set-security-questions`, `inventory` (lazy), `rx` (lazy)

### State Management

Angular services with `BehaviorSubject`/`Subject`. Encrypted sessionStorage via `ng-cryptostore`.

### HTTP / Auth

- `AuthGuard` protects inventory and Rx routes
- Auth tokens stored in sessionStorage (`Authorization`, `ServerAuthorization` headers)
- Session timeout handling with auto-logout
- `CustomRouteReuseStrategy` for route caching

## Key Dependencies

- Angular 16 + Angular Material 16
- Bootstrap (layout)
- `crypto-js` — password encryption
- `ng-cryptostore` — encrypted sessionStorage
- `exceljs` + `file-saver` — Excel report generation
- `moment` — date handling
- `ngx-cookie-service` — cookie management

## Code Conventions

- **License header**: All source files begin with the AMRIT GPL-3.0 license block
- **Component prefix**: `app`
- **Commit convention**: Conventional Commits enforced via commitlint + Husky
- **Pre-commit hook**: `lint-staged` runs ESLint `--fix` on staged `.ts` files

## Environment Configuration

Environment files in `src/environments/`. CI build uses EJS template (`environment.ci.ts.template`) with env vars for API endpoints, encryption keys, and configuration.
