> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `api\.env` (Domain: **Config/Infrastructure**)

### 📐 Config/Infrastructure Conventions & Fixes
- **[what-changed] Updated API endpoint Forward**: - # 2. Forward API requests to the api folder
+ # 2. Forward API requests to the api folder (EXCLUDING images/statics)
- RewriteRule ^api/(.*)$ api/index.php [L]
+ RewriteCond %{REQUEST_URI} !(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp|assets/.*)$ [NC]
- 
+ RewriteRule ^api/(.*)$ api/index.php [L]
- # 3. All other requests go to index.html for React Router
+ 
- RewriteRule ^ index.html [L]
+ # 3. All other requests go to index.html for React Router
- 
+ RewriteRule ^ index.html [L]
+ 
- **[convention] convention in .htaccess**: - # 1. Forward API requests to the api folder
+ # 1. Serve existing files/directories normally (for assets/images)
- RewriteCond %{REQUEST_URI} ^/api [NC]
+ RewriteCond %{REQUEST_FILENAME} -f [OR]
- RewriteRule ^api/(.*)$ api/index.php [L]
+ RewriteCond %{REQUEST_FILENAME} -d
- 
+ RewriteRule ^ - [L]
- # 2. Serve existing files/directories normally (for assets)
+ 
- RewriteCond %{REQUEST_FILENAME} -f [OR]
+ # 2. Forward API requests to the api folder
- RewriteCond %{REQUEST_FILENAME} -d
+ RewriteCond %{REQUEST_URI} ^/api [NC]
- RewriteRule ^ - [L]
+ RewriteRule ^api/(.*)$ api/index.php [L]
- **[what-changed] 🟢 Edited .windsurfrules (6 changes, 117min)**: Active editing session on .windsurfrules.
6 content changes over 117 minutes.
- **[what-changed] what-changed in .gitignore**: + AGENT.md
+ CLAUDE.md
+ .agent-mem/
+ 
