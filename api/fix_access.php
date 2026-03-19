<?php
/**
 * ADVANCED IMAGE DIAGNOSTIC & FIX
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Image Access Diagnostic</h1><pre>";

$base = dirname(__DIR__);
$publicStorage = __DIR__ . '/public/storage';
$targetStorage = __DIR__ . '/storage/app/public';

echo "Base: $base\n";
echo "Public Storage (Link): $publicStorage\n";
echo "Target Storage (Actual): $targetStorage\n\n";

// 1. Verify Target Exists
if (!file_exists($targetStorage)) {
    echo "[ERROR] Target folder does not exist: $targetStorage\n";
    mkdir($targetStorage, 0755, true);
} else {
    echo "[OK] Target folder exists.\n";
    @chmod($targetStorage, 0755);
}

// 2. Verify Symlink Integrity
if (file_exists($publicStorage)) {
    if (is_link($publicStorage)) {
        $actualTarget = readlink($publicStorage);
        echo "[INFO] Symlink found. Points to: $actualTarget\n";
        if (!file_exists($actualTarget)) {
            echo "[ERROR] Symlink is BROKEN! target does not exist.\n";
            unlink($publicStorage);
        }
    } else {
        echo "[ERROR] public/storage is a REAL FOLDER, not a link. Renaming...\n";
        rename($publicStorage, $publicStorage . '_bak_' . time());
    }
}

if (!file_exists($publicStorage)) {
    echo "Creating NEW relative symlink...\n";
    // Using relative path is often SAFER on cPanel
    if (symlink('../storage/app/public', $publicStorage)) {
        echo "[SUCCESS] Relative symlink created: public/storage -> ../storage/app/public\n";
    } else {
        echo "[FAILED] Could not create symlink.\n";
    }
}

// 3. Check for blocking .htaccess in storage
$blockingHtaccess = $targetStorage . '/.htaccess';
if (file_exists($blockingHtaccess)) {
    echo "[WARNING] Found .htaccess in storage folder. Renaming to disable it...\n";
    rename($blockingHtaccess, $blockingHtaccess . '.disabled');
}

// 4. Test access to a specific file
$testFile = $targetStorage . '/blog/ai_69bc457c698f9.png';
if (file_exists($testFile)) {
    echo "[OK] Test file exists: " . basename($testFile) . "\n";
    echo "Permissions: " . substr(sprintf('%o', fileperms($testFile)), -4) . "\n";
    @chmod($testFile, 0644);
} else {
    echo "[ERROR] Test file NOT FOUND on disk. Are you sure it is in: $targetStorage/blog/ ?\n";
}

echo "\n--- SUGGESTION ---\n";
echo "If still 403, add this to your ROOT .htaccess:\n";
echo "Options +FollowSymLinks\n";
echo "</pre>";
