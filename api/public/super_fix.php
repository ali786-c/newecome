<?php
/**
 * SUPER SIMPLIFIED REPAIR
 * Access: https://upgradercx.com/api/super_fix.php
 */

echo "<h1>SUPER REPAIR</h1><pre>";

$base = dirname(__DIR__);

// Create folder manually if Laravel fails
$f = $base . '/storage/framework/views';
if (!file_exists($f)) {
    mkdir($f, 0775, true);
    echo "CREATED: $f\n";
} else {
    echo "EXISTS: $f\n";
}

// Fix symlink
$target = $base . '/storage/app/public';
$link = __DIR__ . '/storage';

if (file_exists($link) && !is_link($link)) {
    rename($link, $link . '_old_' . time());
}

if (!file_exists($link)) {
    symlink($target, $link);
    echo "LINK CREATED: $link -> $target\n";
} else {
    echo "LINK OK\n";
}

echo "DONE. CHECK BLOG NOW.";
