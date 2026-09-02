<?php
/**
 * ROOT-LEVEL EMERGENCY RECOVERY
 * This script fixes the "Please provide a valid cache path" error.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Emergency Recovery Started</h1><pre>";

// Required folders in the current directory (api root)
$folders = [
    'storage/framework/views',
    'storage/framework/sessions',
    'storage/framework/cache',
    'storage/app/public/blog',
    'bootstrap/cache',
];

foreach ($folders as $f) {
    if (!file_exists($f)) {
        if (mkdir($f, 0775, true)) {
            echo "[OK] CREATED: $f\n";
        } else {
            echo "[FAIL] FAILED TO CREATE: $f\n";
        }
    } else {
        echo "[SKIP] EXISTS: $f\n";
        @chmod($f, 0775);
    }
}

// Fix symlink if possible
$target = __DIR__ . '/storage/app/public';
$link = __DIR__ . '/public/storage';

if (file_exists($link) && !is_link($link)) {
    echo "[!] public/storage is a folder, renaming...\n";
    rename($link, $link . '_old_' . time());
}

if (!file_exists($link)) {
    if (symlink($target, $link)) {
        echo "[OK] SYMLINK CREATED: $link -> $target\n";
    } else {
        echo "[FAIL] SYMLINK FAILED. Create it manually in cPanel.\n";
    }
}

echo "\nCOMPLETED. Try accessing your site now.\n";
echo "DELETE THIS FILE IMMEDIATELY.";
echo "</pre>";
