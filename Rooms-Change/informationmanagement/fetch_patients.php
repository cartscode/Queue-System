<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ⭐ AGE FUNCTION — must go at the top, nothing else touched.
function getAgeValue($birthdate) {
    if (!$birthdate) return "N/A";
    $birth = new DateTime($birthdate);
    $today = new DateTime();
    return $today->diff($birth)->y;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "hospital_queuedb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$sql = "SELECT id, name, birthdate, condition_text, type, doctor_type, room, registered_time, status 
        FROM patients ORDER BY id ASC";

$result = $conn->query($sql);

$patients = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {

        // ⭐ REPLACE age with calculated age — nothing else changed
        $patients[] = [
            "id" => $row["id"],
            "name" => $row["name"],
            "birthdate" => $row["birthdate"],
            "age" => getAgeValue($row["birthdate"]),
            "condition_text" => $row["condition_text"],
            "type" => $row["type"],
            "doctor_type" => $row["doctor_type"],
            "room" => $row["room"],
            "registered_time" => $row["registered_time"],
            "status" => $row["status"]
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($patients);



$conn->close();
?>