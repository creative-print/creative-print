<?php
require_once 'config.php';
checkAdmin();

$input = json_decode(file_get_contents('php://input'), true);

$section  = $input['section']  ?? '';
$category = $input['category'] ?? '';
$filename = $input['filename'] ?? '';

global $SECTIONS;

if (!isset($SECTIONS[$section]) || !in_array($category, $SECTIONS[$section])) {
    jsonResponse(['error' => 'قسم غير صحيح'], 400);
}

$filename = sanitizeName($filename);
$baseName = pathinfo($filename, PATHINFO_FILENAME);

$imageFile = UPLOAD_DIR . "$section/$category/images/$filename";
$deleted = [];

// حذف الصورة
if (file_exists($imageFile)) {
    unlink($imageFile);
    $deleted[] = $filename;
}

// حذف ملف AI المرتبط
$aiDir = UPLOAD_DIR . "$section/$category/ai/";
if (is_dir($aiDir)) {
    foreach (ALLOWED_DESIGN as $ext) {
        $aiFile = $aiDir . "$baseName.$ext";
        if (file_exists($aiFile)) {
            unlink($aiFile);
            $deleted[] = "$baseName.$ext";
        }
    }
}

// تحديث الفهرس
require_once 'upload.php';

jsonResponse(['success' => true, 'deleted' => $deleted]);
?>
