<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "hospital_queuedb";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $age = $_POST['age'];
    $condition = $_POST['condition'];
    $type = $_POST['type'];

    $stmt = $conn->prepare("INSERT INTO patients (name, age, condition_text, type) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("siss", $name, $age, $condition, $type);

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "error";
    }

    $stmt->close();
}

$conn->close();
?>
