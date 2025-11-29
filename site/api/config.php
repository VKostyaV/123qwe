<?php
// DB credentials
$host = "localhost";
$user = "root";
$pass = "";
$db   = "webproject_db";

// Optional: make mysqli throw exceptions during development
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    // In dev show details; on prod return a generic message
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>
