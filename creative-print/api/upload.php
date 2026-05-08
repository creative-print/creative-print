<?php
require_once 'config.php';
checkAdmin(); // ← لا يمكن الرفع بدون توكن المسؤول

$section  = $_POST['section']  ?? '';
$category = $_POST['category'] ?? '';

global $SECTIONS;

// التحقق من القسم والتصنيف
if (!isset($SECTIONS[$section]) || !in_array($category, $SECTIONS[$section])) {
    jsonResponse(['error' => 'قسم أو تصنيف غير صحيح'], 400);
}

// التحقق من وجود الملفات
if (empty($_FILES['files'])) {
    jsonResponse(['error' => 'لم يتم رفع أي ملف'], 400);
}

$uploaded = [];
$errors = [];

$files = $_FILES['files'];
$count = is_array($files['name']) ? count($files['name']) : 1;

for ($i = 0; $i < $count; $i++) {
    $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
    $tmp  = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
    $size = is_array($files['size']) ? $files['size'][$i] : $files['size'];
    $err  = is_array($files['error']) ? $files['error'][$i] : $files['error'];

    if ($err !== UPLOAD_ERR_OK) {
        $errors[] = "$name: خطأ في الرفع";
        continue;
    }

    if ($size > MAX_FILE_SIZE) {
        $errors[] = "$name: الحجم كبير جداً";
        continue;
    }

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    
    // تحديد المجلد حسب نوع الملف
    if (in_array($ext, ALLOWED_IMAGES)) {
        $subfolder = 'images';
    } elseif (in_array($ext, ALLOWED_DESIGN)) {
        $subfolder = 'ai';
    } else {
        $errors[] = "$name: نوع غير مسموح";
        continue;
    }

    // إنشاء المجلد إذا لم يكن موجوداً
    $targetDir = UPLOAD_DIR . "$section/$category/$subfolder/";
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $cleanName = sanitizeName($name);
    $targetFile = $targetDir . $cleanName;

    // إذا كان موجود، أضف رقم
    $counter = 1;
    while (file_exists($targetFile)) {
        $info = pathinfo($cleanName);
        $cleanName = $info['filename'] . "_$counter." . $info['extension'];
        $targetFile = $targetDir . $cleanName;
        $counter++;
    }

    if (move_uploaded_file($tmp, $targetFile)) {
        $uploaded[] = [
            'name' => $cleanName,
            'url'  => UPLOAD_URL . "$section/$category/$subfolder/$cleanName",
            'type' => $subfolder
        ];
    } else {
        $errors[] = "$name: فشل الحفظ";
    }
}

// تحديث ملف الفهرس
updateIndex($section, $category);

jsonResponse([
    'success' => true,
    'uploaded' => $uploaded,
    'errors' => $errors,
    'count' => count($uploaded)
]);


// ============ تحديث ملف الفهرس ============
function updateIndex($section, $category) {
    $imagesDir = UPLOAD_DIR . "$section/$category/images/";
    $aiDir     = UPLOAD_DIR . "$section/$category/ai/";
    
    $images = [];
    if (is_dir($imagesDir)) {
        foreach (scandir($imagesDir) as $f) {
            if (preg_match('/\.(jpg|jpeg|png|webp)$/i', $f)) {
                $baseName = pathinfo($f, PATHINFO_FILENAME);
                
                // البحث عن ملف AI مطابق
                $aiFile = null;
                if (is_dir($aiDir)) {
                    foreach (ALLOWED_DESIGN as $ext) {
                        if (file_exists($aiDir . "$baseName.$ext")) {
                            $aiFile = "$baseName.$ext";
                            break;
                        }
                    }
                }
                
                $images[] = [
                    'name' => $f,
                    'url'  => UPLOAD_URL . "$section/$category/images/$f",
                    'ai'   => $aiFile,
                    'size' => filesize($imagesDir . $f),
                    'date' => filemtime($imagesDir . $f)
                ];
            }
        }
    }
    
    file_put_contents(
        UPLOAD_DIR . "$section/$category/index.json",
        json_encode($images, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );
}
?>
