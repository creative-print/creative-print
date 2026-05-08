<?php
require_once 'config.php';
checkAdmin();

$section  = $_GET['section']  ?? '';
$category = $_GET['category'] ?? '';
$filename = $_GET['filename'] ?? '';

global $SECTIONS;

if (!isset($SECTIONS[$section]) || !in_array($category, $SECTIONS[$section])) {
    http_response_code(400);
    exit('قسم غير صحيح');
}

$filename = sanitizeName($filename);
$file = UPLOAD_DIR . "$section/$category/ai/$filename";

if (!file_exists($file)) {
    http_response_code(404);
    exit('الملف غير موجود');
}

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($file) . '"');
header('Content-Length: ' . filesize($file));
readfile($file);
exit;
?>
