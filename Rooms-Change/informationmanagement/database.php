<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection details
$servername = "localhost";
$username = "root"; // default for XAMPP
$password = ""; // leave blank unless you set one
$dbname = "hospital_queuedb"; // ✅ corrected database name

// Function to assign room number based on doctor type
function getRoomNumber($doctor_type) {
    $rooms = [
        'general_practitioner' => '101',
        'pediatrician' => '102',
        'dermatologist' => '103',
        'cardiologist' => '104',
        'orthopedic' => '105',
        'gynecologist' => '106',
    ];
    return $rooms[$doctor_type] ?? 'Unknown';
}

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle the form data when submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $birthdate = $_POST['birthdate'];
    
    // Calculate age from birthdate
    $age = date_diff(date_create($birthdate), date_create('today'))->y;

    $condition = $_POST['condition'];
    $doctor_type = $_POST['doctor_type'];
    $type = $_POST['type'];
    $timestamp = date('Y-m-d H:i:s');

    // Get room number from function
    $room = getRoomNumber($doctor_type);

    $sql = "INSERT INTO patients (name, birthdate, age, condition_text, type, doctor_type, room, registered_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";   

    // Prepare statement for safety
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        die("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("ssisssss", 
        $name, 
        $birthdate, 
        $age, 
        $condition, 
        $type, 
        $doctor_type, 
        $room, 
        $timestamp
    );

    if ($stmt->execute()) {
        echo "<script>
                alert('✅ Patient added successfully to the queue!');
                window.location.href='../informationmanagement/Informationmanagement.php';
              </script>";
    } else {
        echo "<script>
                alert('❌ Error adding patient: " . addslashes($stmt->error) . "');
                window.history.back();
              </script>";
    }

    $stmt->close();
}

// Close the connection
$conn->close();
?>
