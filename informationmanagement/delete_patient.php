<?php
include 'db_connect.php'; // or adjust filename if needed

if (isset($_POST['id'])) {
    $id = intval($_POST['id']);

    $sql = "DELETE FROM patients WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo "success";
    } else {
        echo "Error deleting record: " . $conn->error;
    }
} else {
    echo "No ID received.";
}

$conn->close();
?>
