<?php
session_start();

if (!isset($_SESSION['username'])) {
    header("Location: ../logres/login.php");
    exit;
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "hospital_queuedb";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Room assignment function
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

$doctorTypeLabels = [
    'general_practitioner' => 'General Practitioner',
    'pediatrician' => 'Pediatrician',
    'dermatologist' => 'Dermatologist',
    'cardiologist' => 'Cardiologist',
    'orthopedic' => 'Orthopedic',
    'gynecologist' => 'Gynecologist',
];


// Helper function to convert birthdate to age
function getAgeValue($birthdate) {
    if (!$birthdate) return "N/A";

    try {
        $birth = new DateTime($birthdate);
        $now = new DateTime();
        $age = $now->diff($birth)->y;
        return $age;
    } catch (Exception $e) {
        return "N/A";
    }
}


// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get POST data
    $name = $_POST['name'];
    $birthdate = $_POST['birthdate'];
    $condition = $_POST['condition'];
    $type = $_POST['type'];
    $doctor_type = $_POST['doctor_type'];

    // Assign room number server side
    $room = getRoomNumber($doctor_type);

    // Prepare and execute insert statement (safer than raw query)
    $stmt = $conn->prepare("INSERT INTO patients (name, birthdate, condition_text, type, doctor_type, room, registered_time, status) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'Waiting')");
    $stmt->bind_param("ssssss", $name, $birthdate, $condition, $type, $doctor_type, $room);

    if ($stmt->execute()) {
        // Success: redirect or show message
        echo "<script>
                alert('✅ Patient added successfully to the queue!');
                window.location.href='../informationmanagement/Informationmanagement.php';
              </script>";
        exit;
    } else {
        echo "<script>
                alert('❌ Error adding patient: " . addslashes($stmt->error) . "');
                window.history.back();
              </script>";
        exit;
    }
    $stmt->close();
}
// FETCH patients for display in queues (MUST be done every page load, not just on POST)
$regularPatients = [];
$result = $conn->query("SELECT * FROM patients WHERE type='regular' ORDER BY registered_time ASC");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['age'] = getAgeValue($row['birthdate']);  // add age here
        $regularPatients[] = $row;
    }
}

$priorityPatients = [];
$result2 = $conn->query("SELECT * FROM patients WHERE type='priority' ORDER BY registered_time ASC");
if ($result2) {
    while ($row = $result2->fetch_assoc()) {
        $row['age'] = getAgeValue($row['birthdate']);  // add age here
        $priorityPatients[] = $row;
    }
}


$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="infoms.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
  <title>Hospital Queue Management</title>
</head>
<body>

<header>
  <nav class="navbar">
    <a href="index.html" class="logo">HealthCare+</a>

    <!-- Hamburger -->
    <div class="menu-toggle" id="menu-toggle">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <ul class="nav-links" id="nav-links">
      <li><a class="register-btn" onclick="logout()">Log out</a></li>
    </ul>
  </nav>
</header>

<section style="text-align:center; margin-top:30px;">
  <h1>Hospital Queue Management</h1>
  <p>Real-time patient queue monitoring and management system</p>
</section>

<!-- Live Dashboard Summary -->
<div class="dashboard-summary">
  <div class="card-summary">
    <div class="icon purple">👥</div>
    <div>
      <p>Total Patients</p>
      <h2 id="totalPatients">0</h2>
    </div>
  </div>

  <div class="card-summary">
    <div class="icon yellow">⏳</div>
    <div>
      <p>Currently Waiting</p>
      <h2 id="waitingPatients">0</h2>
    </div>
  </div>

  <div class="card-summary">
    <div class="icon violet">⚕️</div>
    <div>
      <p>In Progress</p>
      <h2 id="inProgress">0</h2>
    </div>
  </div>

  <div class="card-summary">
    <div class="icon green">🕐</div>
    <div>
      <p>Avg Wait Time</p>
      <h2 id="avgWait">&lt; 1 min</h2>
    </div>
  </div>
</div>

<div class="container">

  <!-- Register Form -->
  <div class="card">
    <h3>➕ Register New Patient</h3>
  
    <form id="patientForm" method="POST" action="database.php">
      <label>Patient Name</label>
      <input type="text" name="name" id="patientName" placeholder="Enter full name" required>

      <label>Birthdate</label>
      <input type="date" name="birthdate" id="patientBirthdate" required>

      <label>Condition</label>
      <input type="text" name="condition" id="patientCondition" placeholder="e.g., Severe headache, Sprained ankle" required>

      <label>Patient Type</label>
      <select name="type" id="patientType" required>
        <option value="regular">Regular patient</option>
        <option value="priority">Priority patient</option>
      </select>

      <label>Doctor Type</label>
      <select name="doctor_type" id="doctorType" required>
        <option value="">-- Select Doctor Type --</option>
        <option value="general_practitioner">General Practitioner</option>
        <option value="pediatrician">Pediatrician</option>
        <option value="dermatologist">Dermatologist</option>
        <option value="cardiologist">Cardiologist</option>
        <option value="orthopedic">Orthopedic</option>
        <option value="gynecologist">Gynecologist</option>
      </select>
      
<p id="roomDisplay" style="font-weight: bold; margin-top: 5px;">Assigned Room: -</p>

      <button type="submit">Add Patient to Queue</button>
    </form>

    <button onclick="goToDashboard()">Live Dashboard</button>
  </div>


  <!-- Queues Display -->
  <div>
  <div class="card queue-section">
    <h4>📋 Regular Patient Queue</h4>
    <div class="table-container">
      <table id="regularQueue">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Age</th>
            <th>Doctor Type</th>
            <th>Room</th>
            <th>Condition</th>
            <th>Registered</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
<tbody id="regularQueueBody">
  <?php
  if (!isset($regularPatients) || !is_array($regularPatients) || count($regularPatients) === 0) {
      echo '<tr><td colspan="9" class="empty">Queue is empty...</td></tr>';
  } else {
      foreach ($regularPatients as $index => $patient) {
          echo "<tr>";
          echo "<td>" . ($index + 1) . "</td>";
          echo "<td>" . htmlspecialchars($patient['name']) . "</td>";
          // Convert birthdate to age for display only
          echo "<td>" . htmlspecialchars($patient['age']) . "</td>";
          echo "<td>" . htmlspecialchars($doctorTypeLabels[$patient['doctor_type']] ?? $patient['doctor_type']) . "</td>";
          echo "<td>" . htmlspecialchars($patient['room']) . "</td>";
          echo "<td>" . htmlspecialchars($patient['condition_text']) . "</td>";
          echo "<td>" . htmlspecialchars($patient['registered_time']) . "</td>";
          echo "<td>" . htmlspecialchars($patient['status']) . "</td>";
          echo "<td>Actions here</td>"; // Replace with buttons/links later
          echo "</tr>";
      }
  }
  ?>
</tbody>

      </table>
    </div>
  </div>

  <div class="card queue-section">
    <h4>📋 Priority Patient Queue</h4>
    <div class="table-container">
      <table id="priorityQueue">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Age</th>
            <th>Doctor Type</th>
            <th>Room</th>
            <th>Condition</th>
            <th>Registered</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="priorityQueueBody">
          <?php
          if (count($priorityPatients) === 0) {
              echo '<tr><td colspan="9" class="empty">Queue is empty...</td></tr>';
          } else {
              foreach ($priorityPatients as $index => $patient) {
                  echo "<tr>";
                  echo "<td>" . ($index + 1) . "</td>";
                  echo "<td>" . htmlspecialchars($patient['name']) . "</td>";
                  // Convert birthdate to age for display only
                  echo "<td>" . htmlspecialchars($patient['age']) . "</td>";
                  echo "<td>" . htmlspecialchars($doctorTypeLabels[$patient['doctor_type']] ?? $patient['doctor_type']) . "</td>";
                  echo "<td>" . htmlspecialchars($patient['room']) . "</td>";
                  echo "<td>" . htmlspecialchars($patient['condition_text']) . "</td>";
                  echo "<td>" . htmlspecialchars($patient['registered_time']) . "</td>";
                  echo "<td>" . htmlspecialchars($patient['status']) . "</td>";
                  echo "<td>Actions here</td>";
                  echo "</tr>";
              }
          }
          ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script src="scriptinfo.js"></script>

<script>
// 🔹 FIXED: Manual logout only
function logout() {
    fetch("../logres/logout.php")
      .then(() => window.location.href = "../logres/login.php");
}

// ❌ REMOVED: Auto logout when refreshing/closing tab
// It was causing the session to end on every page reload.
</script>
<script>
document.addEventListener("DOMContentLoaded", () => {
  const roomNumbers = {
    general_practitioner: "101",
    pediatrician: "102",
    dermatologist: "103",
    cardiologist: "104",
    orthopedic: "105",
    gynecologist: "106",
  };

  const doctorTypeSelect = document.getElementById("doctorType");
  const roomDisplay = document.getElementById("roomDisplay");

  doctorTypeSelect.addEventListener("change", () => {
    const selectedDoctor = doctorTypeSelect.value;
    console.log("Doctor type selected:", selectedDoctor);
    if (roomNumbers[selectedDoctor]) {
      roomDisplay.textContent = `Assigned Room: ${roomNumbers[selectedDoctor]}`;
    } else {
      roomDisplay.textContent = "Assigned Room: -";
    }
  });
});
</script>

</body>
</html>
