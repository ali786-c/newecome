# UpgraderCX - Production & Development Environment

This folder contains the production-ready code for the UpgraderCX SaaS deployment.

## 📁 Folder Structure
- **`/ (Root)`**: Production UI assets (React built files).
- **`/api`**: Production Backend (Laravel).
- **`/upgradercx-source updated`**: ⚠️ **CRITICAL SOURCE CODE**. Use this folder for all UI development and changes.
- **`/upgrader-pay-hub`**: Dedicated directory for the Centralized Payment Hub project.
- **`/backup`**: Original files backup.

## 🛠 Development Workflow (UI)
1.  Make changes in `upgradercx-source updated/artifacts/upgradercx/src`.
2.  Run `pnpm run build` in that folder.
3.  Copy the `dist/public` contents to this root folder.

## 🚀 Deployment (cPanel)
- Point your addon domain to this root folder.
- Configure `api/.env`.
- Visit `your-domain.com/api/migrate` to initialize the database.

---
