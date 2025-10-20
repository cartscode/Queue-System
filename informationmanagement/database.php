<?php
// Database connection
$servername = "localhost";
$username = "root"; // default XAMPP
$password = "";
$dbname = "hospital_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get POST data
$name = $_POST['name'];
$age = $_POST['age'];
$condition = $_POST['condition'];
$type = $_POST['type']; // "regular" or "priority"

// Convert type to proper capitalization for consistency
$type = ucfirst(strtolower($type));

// Default status
$status = "Waiting";

// Insert patient
$sql = "INSERT INTO patients (name, age, condition_text, type, status) 
        VALUES ('$name', '$age', '$condition', '$type', '$status')";

if ($conn->query($sql) === TRUE) {
    // Redirect back to the dashboard after adding
    header("Location: index.html");
    exit();
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
