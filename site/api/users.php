<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "config.php";

$res = $conn->query("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC");

$users = [];

while ($row = $res->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode($users);
?>
