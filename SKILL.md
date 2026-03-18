---
name: UpgraderCX Development
description: Rules and instructions for developing the UpgraderCX SaaS project.
---

# UpgraderCX Development Guidelines

## Project Structure
- **Production UI**: Root directory (`index.html`, `assets/`, etc.)
- **Production Backend**: `api/` directory
- **Source Code (UI/Frontend)**: `c:\Users\Muhammad Aliyan\Downloads\upgradercx-full-project\upgradercx-source updated\artifacts\upgradercx`
- **Upgrader Pay Hub (Source & Hub Project)**: `c:\Users\Muhammad Aliyan\Downloads\upgradercx-full-project\upgrader-pay-hub`

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
5. **Mandatory GitHub Push**:
   - Whenever ANY change is made to the codebase (source, build, or direct), the updated code MUST be pushed to GitHub.
   - Target Repo: `https://github.com/ali786-c/newecome`.
   - Command: `git add .`, `git commit -m "Update from AI assistant"`, `git push origin master`.

6. **Upgrader Pay Hub Development**:
   - ALL Pay Hub related code (API and Frontend) MUST be developed in the `c:\Users\Muhammad Aliyan\Downloads\upgradercx-full-project\upgrader-pay-hub` directory.
   - Use the dedicated `pay_hub_task.md` and `pay_hub_implementation_plan.md` artifacts for this project.
   - **Deployment Note**: The Hub will run on an **Addon Domain** outside `public_html`. Ensure all routing and directory references remain relative or absolute-to-root to support this isolation.
7. **Cross-Project Coordination**:
   - When integrating the Hub with UpgraderCX, ensure signatures match between both codebases.
