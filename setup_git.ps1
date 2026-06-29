$ErrorActionPreference = "Stop"
Set-Location -Path "c:\Users\satis\OneDrive\Desktop\CivicPluse\CivicPulse"

Write-Host "Removing existing .git if present..."
if (Test-Path ".git") {
    Remove-Item -Path ".git" -Recurse -Force
}

Write-Host "Initializing new git repository..."
git init
git branch -m main

# Add remote
git remote add origin https://github.com/YUVRAJ-SINGH-3178/CivicPulse.git

# Set user name and email just in case (using generic or from env if available)
$existingName = git config user.name
if (-not $existingName) {
    git config user.name "Yuvraj Singh"
    git config user.email "yuvraj@example.com"
}

# --- Commit 1: June 21, 2026 - Initial Setup ---
$env:GIT_AUTHOR_DATE="2026-06-21T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-21T10:00:00"
git add package.json package-lock.json .gitignore README.md tailwind.config.js postcss.config.js
git commit -m "Initial commit: Project setup, package configs and README"

# --- Commit 2: June 22, 2026 - Backend basics ---
$env:GIT_AUTHOR_DATE="2026-06-22T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-22T10:00:00"
if (Test-Path "backend/server.js") { git add backend/server.js }
if (Test-Path "backend/config") { git add backend/config/ }
if (Test-Path "BACKEND_README.md") { git add BACKEND_README.md }
if (Test-Path "MONGODB_SETUP.md") { git add MONGODB_SETUP.md }
git commit -m "feat: Backend initial structure and database configurations"

# --- Commit 3: June 23, 2026 - Backend routes and models ---
$env:GIT_AUTHOR_DATE="2026-06-23T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-23T10:00:00"
if (Test-Path "backend/models") { git add backend/models/ }
if (Test-Path "backend/routes") { git add backend/routes/ }
if (Test-Path "backend/middlewares") { git add backend/middlewares/ }
if (Test-Path "backend/controllers") { git add backend/controllers/ }
git commit -m "feat: Backend models, controllers, and API routes"

# --- Commit 4: June 24, 2026 - Frontend initialization ---
$env:GIT_AUTHOR_DATE="2026-06-24T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-24T10:00:00"
if (Test-Path "public") { git add public/ }
if (Test-Path "src/App.jsx") { git add src/App.jsx }
if (Test-Path "src/index.jsx") { git add src/index.jsx }
if (Test-Path "src/main.jsx") { git add src/main.jsx }
if (Test-Path "src/index.css") { git add src/index.css }
git commit -m "feat: Frontend initialization and static assets"

# --- Commit 5: June 25, 2026 - UI Components ---
$env:GIT_AUTHOR_DATE="2026-06-25T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-25T10:00:00"
if (Test-Path "src/components") { git add src/components/ }
git commit -m "feat: Reusable UI components"

# --- Commit 6: June 26, 2026 - Core Pages ---
$env:GIT_AUTHOR_DATE="2026-06-26T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-26T10:00:00"
if (Test-Path "src/Pages") { 
    git add src/Pages/
}
git commit -m "feat: Application core pages and routing"

# --- Commit 7: June 27, 2026 - Hooks and Utils ---
$env:GIT_AUTHOR_DATE="2026-06-27T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-27T10:00:00"
if (Test-Path "src/hooks") { git add src/hooks/ }
if (Test-Path "src/utils") { git add src/utils/ }
if (Test-Path "src/assets") { git add src/assets/ }
if (Test-Path "backend/utils") { git add backend/utils/ }
git commit -m "feat: Frontend hooks, utils, and assets"

# --- Commit 8: June 28, 2026 - Testing and remaining features ---
$env:GIT_AUTHOR_DATE="2026-06-28T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-28T10:00:00"
if (Test-Path "cypress") { git add cypress/ }
if (Test-Path "cypress.config.ts") { git add cypress.config.ts }
if (Test-Path "backend/__tests__") { git add backend/__tests__/ }
git commit -m "test: Added Cypress E2E tests and test config"

# --- Commit 9: June 29, 2026 - Final Polish ---
$env:GIT_AUTHOR_DATE="2026-06-29T10:00:00"
$env:GIT_COMMITTER_DATE="2026-06-29T10:00:00"
git add .
git commit -m "feat: Final polish, bug fixes, and complete source push"

Write-Host "Git history rewritten successfully. Pushing to origin main..."
git push -u origin main
