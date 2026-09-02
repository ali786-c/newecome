<?php
/**
 * ZERO-DEPENDENCY EMERGENCY REPAIR SCRIPT
 * 
 * This script will create missing folders and fix symlinks without booting Laravel.
 * Access: https://upgradercx.com/api/repair_storage.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Zero-Dependency Environment Repair</h1>";
echo "<pre>";

$baseDir = dirname(__DIR__);
echo "Base Directory: $baseDir\n\n";

// 1. Create Required Missing Folders
$requiredFolders = [
    $baseDir . '/storage',
    $baseDir . '/storage/app',
    $baseDir . '/storage/app/public',
    $baseDir . '/storage/app/public/blog',
    $baseDir . '/storage/framework',
    $baseDir . '/storage/framework/cache',
    $baseDir . '/storage/framework/cache/data',
    $baseDir . '/storage/framework/sessions',
    $baseDir . '/storage/framework/views',
    $baseDir . '/storage/logs',
    $baseDir . '/bootstrap/cache',
];

echo "Checking/Creating Folders:\n";
foreach ($requiredFolders as $folder) {
    if (!file_exists($folder)) {
        if (mkdir($folder, 0775, true)) {
            echo "[CREATED] $folder\n";
        } else {
            echo "[FAILED]  $folder\n";
        }
    } else {
        echo "[EXISTS]  $folder\n";
        @chmod($folder, 0775); // Ensure correct permissions
    }
}

// 2. Fix Symbolic Link
echo "\nChecking Symbolic Link:\n";
$target = $baseDir . '/storage/app/public';
$link = __DIR__ . '/storage';

if (file_exists($link)) {
    if (is_link($link)) {
        echo "[EXISTS] Link is already a symbolic link.\n";
    } else {
        echo "[WARNING] Path 'public/storage' exists but is NOT a link. Renaming to public/storage_old...\n";
        rename($link, $link . '_old_' . time());
    }
}

if (!file_exists($link)) {
    echo "Creating symlink: $link -> $target\n";
    if (symlink($target, $link)) {
        echo "[SUCCESS] Symlink created!\n";
    } else {
        echo "[FAILED]  Could not create symlink.\n";
    }
}

echo "\n-------------------------\n";
echo "Repair Attempt Finished.\n";
echo "<h1>PLEASE REFRESH YOUR MAIN BLOG PAGE NOW</h1>";
echo "<h1>THEN DELETE THIS FILE FOR SECURITY</h1>";
echo "</pre>";
