<?php
// ============ إعدادات الأمان ============
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// ============ كلمة المرور ============
define('ADMIN_PIN', '1234');                    // غيّرها!
define('ADMIN_TOKEN', 'CR8tive_PR1nt_S3cret');  // توكن سري - غيّره!

// ============ المسارات ============
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', '/creative-print/uploads/');

// ============ الإعدادات ============
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50 MB

define('ALLOWED_IMAGES', ['jpg', 'jpeg', 'png', 'webp']);
define('ALLOWED_DESIGN', ['ai', 'psd', 'pdf', 'cdr', 'eps']);

// ============ الأقسام والتصنيفات ============
$SECTIONS = [
    'certificates' => ['SCHOOL', 'SPORT', 'EVENT'],
    'badges'       => ['GOLD', 'SILVER', 'BRONZE'],
    'invitations'  => ['WEDDING', 'BIRTHDAY', 'GRADUATION'],
    'gifts'        => ['MUGS', 'TSHIRTS', 'FRAMES'],
];

// ============ دوال مساعدة ============
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function checkAdmin() {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? $_POST['token'] ?? $_GET['token'] ?? '';
    if ($token !== ADMIN_TOKEN) {
        jsonResponse(['error' => 'غير مصرح - يجب تسجيل دخول المسؤول'], 403);
    }
}

function sanitizeName($name) {
    $name = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $name);
    return $name;
}
?>
