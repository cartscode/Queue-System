<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection details
$servername = "localhost";
$username = "root"; // default for XAMPP
$password = ""; // leave blank unless you set one
$dbname = "hospital_queuedb"; // ✅ corrected database name

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle the form data when submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the data from the form
    $name = $_POST['name'];
    $age = $_POST['age'];
    $condition = $_POST['condition'];
    $type = $_POST['type'];

    // Insert data into the database
    $sql = "INSERT INTO patients (name, age, condition_text, type)
            VALUES ('$name', '$age', '$condition', '$type')";

    if ($conn->query($sql) === TRUE) {
        // ✅ Keep this good part: alert and redirect to the form
        echo "<script>
                alert('✅ Patient added successfully to the queue!');
                window.location.href='informationmanagement.html';
              </script>";
    } else {
        echo "<script>
                alert('❌ Error adding patient: " . addslashes($conn->error) . "');
                window.history.back();
              </script>";
    }
}

// Close the connection
$conn->close();
?>
