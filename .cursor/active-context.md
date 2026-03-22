> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `.htaccess` (Domain: **Generic Logic**)

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] what-changed in .htaccess**: - Finalizing the analysis and preparing the report.
+ 
- 
- 
- **[what-changed] what-changed in .htaccess**: - 
+ Finalizing the analysis and preparing the report.
+ 
+ 
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
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-CVYTzx6N.js"></script>
+   <script type="module" crossorigin src="/assets/index-CVYTzx6N.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
-     <div id="root"></div>
+     <div id="root"></div>
- </body>
+ 
- 
+ </body>
- </html>
+ 
+ </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-7uyTlInj.js"></script>
+   <script type="module" crossorigin src="/assets/index-CVYTzx6N.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
-     <div id="root"></div>
+     <div id="root"></div>
- 
+ </body>
- </body>
+ 
- 
+ </html>
- </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-7uyTlInj.js"></script>
+   <script type="module" crossorigin src="/assets/index-7uyTlInj.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
-     <div id="root"></div>
+     <div id="root"></div>
- </body>
+ 
- 
+ </body>
- </html>
+ 
+ </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[convention] what-changed in index.html — confirmed 3x**: -   <script type="module" crossorigin src="/assets/index-Cv2UnPRL.js"></script>
+   <script type="module" crossorigin src="/assets/index-7uyTlInj.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
-     <div id="root"></div>
+     <div id="root"></div>
- 
+ </body>
- </body>
+ 
- 
+ </html>
- </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-Cv2UnPRL.js"></script>
+   <script type="module" crossorigin src="/assets/index-Cv2UnPRL.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
-     <div id="root"></div>
+     <div id="root"></div>
- </body>
+ 
- 
+ </body>
- </html>
+ 
+ </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-Cg-IBwvX.js"></script>
+   <script type="module" crossorigin src="/assets/index-Cv2UnPRL.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-D399EnR1.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-hBis5y-G.css">
-     <div id="root"></div>
+     <div id="root"></div>
- 
+ </body>
- </body>
+ 
- 
+ </html>
- </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-Cg-IBwvX.js"></script>
+   <script type="module" crossorigin src="/assets/index-Cg-IBwvX.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-D399EnR1.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-D399EnR1.css">
-     <div id="root"></div>
+     <div id="root"></div>
- </body>
+ 
- 
+ </body>
- </html>
+ 
+ </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-BIQGMVlF.js"></script>
+   <script type="module" crossorigin src="/assets/index-Cg-IBwvX.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-gSCb-3St.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-D399EnR1.css">
-     <div id="root"></div>
+     <div id="root"></div>
- 
+ </body>
- </body>
+ 
- 
+ </html>
- </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-BIQGMVlF.js"></script>
+   <script type="module" crossorigin src="/assets/index-BIQGMVlF.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-gSCb-3St.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-gSCb-3St.css">
-     <div id="root"></div>
+     <div id="root"></div>
- </body>
+ 
- 
+ </body>
- </html>
+ 
+ </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[what-changed] what-changed in index.html**: -   <script type="module" crossorigin src="/assets/index-CIWArmIU.js"></script>
+   <script type="module" crossorigin src="/assets/index-BIQGMVlF.js"></script>
-   <link rel="stylesheet" crossorigin href="/assets/index-DqNGq3YR.css">
+   <link rel="stylesheet" crossorigin href="/assets/index-gSCb-3St.css">
-     <div id="root"></div>
+     <div id="root"></div>
- 
+ </body>
- </body>
+ 
- 
+ </html>
- </html>

📌 IDE AST Context: Modified symbols likely include [html]
- **[decision] Optimized Sync — ensures atomic multi-step database operations**: -    - Sync the generated `dist/public` folder to the root of `upgradercx-full-project`.
+    - Sync the **CONTENTS** of the generated `dist/public` folder directly to the **ROOT** of `upgradercx-full-project`.
- 3. **Backend Development**:
+    - **IMPORTANT**: Delete the `public/` folder in the root if it exists; all UI assets (index.html, assets/, etc.) must be at the top level.
-    - Backend changes can be made directly in the `api/` folder or in `upgradercx-source updated/artifacts/laravel-backend` and then synced.
+ 3. **Backend Development**:
- 4. **Subfolder Optimization**:
+    - Backend changes can be made directly in the `api/` folder or in `upgradercx-source updated/artifacts/laravel-backend` and then synced.
-    - Always ensure `api/index.php` and `.htaccess` files maintain the path refactors for subfolder execution on cPanel.
+ 4. **Subfolder Optimization**:
- 5. **Mandatory GitHub Push**:
+    - Always ensure `api/index.php` and `.htaccess` files maintain the path refactors for subfolder execution on cPanel.
-    - Whenever ANY change is made to the codebase (source, build, or direct), the updated code MUST be pushed to GitHub.
+ 5. **Mandatory GitHub Push**:
-    - Target Repo: `https://github.com/ali786-c/newecome`.
+    - Whenever ANY change is made to the codebase (source, build, or direct), the updated code MUST be pushed to GitHub.
-    - Command: `git add .`, `git commit -m "Update from AI assistant"`, `git push origin master`.
+    - Target Repo: `https://github.com/ali786-c/newecome`.
- 
+    - Command: `git add .`, `git commit -m "Update from AI assistant"`, `git push origin master`.
- 6. **Upgrader Pay Hub Development**:
+ 
-    - ALL Pay Hub related code (API and Frontend) MUST be developed in the `c:\Users\Muhammad Aliyan\Downloads\upgradercx-full-project\upgrader-pay-hub` directory.
+ 6. **Upgrader Pay Hub Development**:
-    - Use the dedicated `pay_hub_task.md` and `pay_hub_implementation_plan.md` artifacts for this project.
+    - ALL Pay Hub related code (API and Frontend) MUST be developed in the `c:\Users\Muhammad Aliyan\Downloads\upgradercx-full-project\upgrader-pay-hub` directory.
-    - **Deployment Note**: The Hub will run on an **Addon Domain** outside `public_html`. Ensure all routing and directory references remain relative or absolute-to-root to support this isolation.
+    - Use the dedicated `pay_hub_task.md` and `pay_hub_implementation_plan.md` artifacts for this project.
- 7. **Cross-Project Coordination**:
+    - **Deployment Note**: The Hub will run on an **Addon Domain** outside `public_html`. Ensure all routing and directory references remain relative or absolute-to-root to support this isolation.
-    - When integrating the Hub with UpgraderCX, ensure signatures match between both codebases.
+ 7. **Cross-Project Coordination**:
- 
+    - When integrating the Hub with UpgraderCX, ensure signatures match between both codebases.
+ 

📌 IDE AST Context: Modified symbols likely include [# UpgraderCX Development Guidelines]
