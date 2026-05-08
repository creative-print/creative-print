<?php
require_once 'config.php';

$section  = $_GET['section']  ?? '';
$category = $_GET['category'] ?? '';

global $SECTIONS;

if (!isset($SECTIONS[$section]) || !in_array($category, $SECTIONS[$section])) {
    jsonResponse(['error' => 'قسم غير صحيح'], 400);
}

$indexFile = UPLOAD_DIR . "$section/$category/index.json";

if (!file_exists($indexFile)) {
    jsonResponse(['files' => []]);
}

$data = json_decode(file_get_contents($indexFile), true);

// إخفاء معلومات ملف AI عن غير المسؤول
$isAdmin = ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '') === ADMIN_TOKEN;
if (!$isAdmin) {
    foreach ($data as &$item) {
        unset($item['ai']);
    }
}

jsonResponse(['files' => $data, 'isAdmin' => $isAdmin]);
?>
