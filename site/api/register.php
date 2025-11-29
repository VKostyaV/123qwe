<?php
// Enable error display for development (turn off on production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Require DB config (use absolute path based on this file's dir)
require_once __DIR__ . '/config.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Basic JSON validation
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

// Required fields
if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or incomplete input']);
    exit;
}

$name = trim($data['name']);
$email = trim($data['email']);
$rawPass = $data['password'];

// Server-side validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}
if (strlen($rawPass) < 8) {
    http_response_code(400);
    echo json_encode(['error' => 'Password too short (min 8 chars)']);
    exit;
}

// Hash password
$hashedPass = password_hash($rawPass, PASSWORD_DEFAULT);

// 1) Check if email exists
$checkStmt = $conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
if (!$checkStmt) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Prepare Error (Check Email): ' . $conn->error]);
    exit;
}
$checkStmt->bind_param('s', $email);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    $checkStmt->close();
    http_response_code(409); // conflict
    echo json_encode(['error' => 'Email already registered']);
    exit;
}
$checkStmt->close();

// 2) Insert new user
$insertStmt = $conn->prepare("INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())");
if (!$insertStmt) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Prepare Error (Insert): ' . $conn->error]);
    exit;
}

$insertStmt->bind_param('sss', $name, $email, $hashedPass);

if ($insertStmt->execute()) {
    http_response_code(201);
    echo json_encode(['message' => 'Successfully registered! Welcome, ' . $name . '.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed: ' . $insertStmt->error]);
}

$insertStmt->close();
$conn->close();
?>
