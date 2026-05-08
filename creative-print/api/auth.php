<?php
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$pin = $input['pin'] ?? '';

if ($pin === ADMIN_PIN) {
    jsonResponse([
        'success' => true,
        'token' => ADMIN_TOKEN,
        'message' => 'تم تسجيل الدخول بنجاح'
    ]);
} else {
    jsonResponse(['error' => 'الرمز السري غير صحيح'], 401);
}
?>
