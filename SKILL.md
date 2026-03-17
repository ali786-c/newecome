---
name: UpgraderCX Development
description: Rules and instructions for developing the UpgraderCX SaaS project.
---

# UpgraderCX Development Guidelines

## Project Structure
- **Production UI**: Root directory (`index.html`, `assets/`, etc.)
- **Production Backend**: `api/` directory
- **Source Code (UI/Frontend)**: `c:\Users\Muhammad Aliyan\Downloads\upgradercx-full-project\upgradercx-source updated\artifacts\upgradercx`

## Rules
1. **Source of Truth for UI**:
   - ALL frontend/UI changes MUST be performed in the `upgradercx-source updated` directory.
   - Specifically: `upgradercx-source updated/artifacts/upgradercx/src`
2. **Build & Sync Workflow**:
   - After making UI changes, run `pnpm run build` inside `upgradercx-source updated/artifacts/upgradercx`.
   - Sync the generated `dist/public` folder to the root of `upgradercx-full-project`.
3. **Backend Development**:
   - Backend changes can be made directly in the `api/` folder or in `upgradercx-source updated/artifacts/laravel-backend` and then synced.
4. **Subfolder Optimization**:
   - Always ensure `api/index.php` and `.htaccess` files maintain the path refactors for subfolder execution on cPanel.
