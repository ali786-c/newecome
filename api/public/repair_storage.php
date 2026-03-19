<?php
/**
 * LIVE SERVER STORAGE & PERMISSION REPAIR
 * 
 * Access this via browser: https://upgradercx.com/api/repair_storage.php
 * Delete this file immediately after use!
 */

echo "<h1>Laravel Storage & Permission Repair</h1>";
echo "<pre>";

// 1. Create Symlink if missing
$target = __DIR__ . '/../storage/app/public';
$link = __DIR__ . '/storage';

if (!file_exists($link)) {
    echo "Creating symbolic link...\n";
    if (symlink($target, $link)) {
        echo "Successfully created symlink: public/storage -> storage/app/public\n";
    } else {
        echo "FAILED to create symlink. Please contact support or do it manually.\n";
    }
} else {
    echo "Symlink already exists.\n";
}

// 2. Fix Permissions
echo "\nFixing permissions...\n";
$dirs = [
    __DIR__ . '/../storage',
    __DIR__ . '/../storage/logs',
    __DIR__ . '/../storage/framework',
    __DIR__ . '/../storage/app/public/blog',
    __DIR__ . '/../bootstrap/cache',
];

foreach ($dirs as $dir) {
    if (file_exists($dir)) {
        chmod($dir, 0775);
        echo "Set 0775 for: $dir\n";
    }
}

echo "\n-------------------------\n";
echo "Status: REPAIR ATTEMPT COMPLETE\n";
echo "<h1>IMPORTANT: DELETE THIS FILE NOW!</h1>";
echo "</pre>";
