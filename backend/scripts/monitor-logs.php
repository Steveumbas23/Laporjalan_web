<?php

$logFile = __DIR__ . '/../storage/logs/laravel.log';

if (!file_exists($logFile)) {
    echo "Log file not found: {$logFile}\n";
    exit(1);
}

$keywords = [
    'Failed login attempt',
    'User login',
    'User logout',
    'Admin updated report',
    'Admin deleted report',
    'Admin viewed user count',
];

$lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

if ($lines === false) {
    echo "Failed to read log file.\n";
    exit(1);
}

$matches = [];

foreach ($lines as $line) {
    foreach ($keywords as $keyword) {
        if (stripos($line, $keyword) !== false) {
            $matches[] = $line;
            break;
        }
    }
}

echo "=== Monitoring Log Report ===\n";
echo "Log file: {$logFile}\n";
echo "Total matched entries: " . count($matches) . "\n\n";

foreach ($matches as $match) {
    echo $match . "\n";
}
