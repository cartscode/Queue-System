<?php
include('config.php');
session_start();

$message = "";
$form_submitted = false;

// Register
if (isset($_POST['register'])) {
    $form_submitted = true;
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    // Check if email already exists
    $check = mysqli_query($conn, "SELECT * FROM users WHERE email='$email'");
    if (mysqli_num_rows($check) > 0) {
        $message = "Email already exists!";
    } else {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $query = "INSERT INTO users (email, password) VALUES ('$email', '$hashed')";
        if (mysqli_query($conn, $query)) {
            header("Location: login.php?registered=success");
            exit;
        } else {
            $message = "Registration failed: " . mysqli_error($conn);
        }
    }
}

// Login
if (isset($_POST['login'])) {
    $form_submitted = true;
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    $result = mysqli_query($conn, "SELECT * FROM users WHERE email='$email'");
    $user = mysqli_fetch_assoc($result);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['email'] = $email;
        header("Location: /Project in CC105/informationmanagement/informationmanagement.html");
        exit;
    } else {
        $message = "Invalid email or password!";
    }
}
?>






<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hospital Management - Login</title>
    <link rel="icon" href="icons/hospital.png" type="image/png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="login.css" rel="stylesheet">
</head>
<body>

<?php if ($form_submitted && !empty($message)): ?>
    <div class="alert alert-danger text-center" role="alert">
        <?php echo $message; ?>
    </div>
<?php endif; ?>

<?php if (isset($_GET['registered']) && $_GET['registered'] === 'success'): ?>
    <div class="alert alert-success text-center">
        Registration successful! You can now log in.
    </div>
<?php endif; ?>

    <nav class="navbar navbar-expand-lg navbar-custom">
        <div class="container">

            <a class="navbar-brand fw-bold">HealthCare+</a>

            <div class="ms-auto">
                <a href="\Project in CC105\home\index.html" class="btn btn-login fw-bold">Back To Home</a>
            </div>
        </div>
    </nav>

    <div class="bubbles">
        <?php for ($i=0; $i<25; $i++): ?>
            <div class="bubble"></div>
        <?php endfor; ?>
    </div>


    <div class="auth-wrapper">
        <div class="auth-card">
            <!-- Register Form -->
            <div id="registerForm">
                <h3>Register</h3>
                <form method="POST" action="">
                    <div class="mb-3">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" placeholder="Enter your name" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input type="password" name="password" id="regPassword" class="form-control" placeholder="Create a password"
                            required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Confirm Password</label>
                        <input type="password" id="regConfirmPassword" class="form-control"
                            placeholder="Confirm your password" required>
                    </div>
                    <button type="submit" name="register" class="btn btn-login w-100">Register</button>
                </form>
                <p class="text-center mt-3">Already have an account?
                    <a href="#" class="toggle-link" onclick="toggleForms()">Login</a>
                </p>
            </div>

            <!-- Login Form (hidden by default) -->
            <div id="loginForm" style="display:none;">
                <h3>Login</h3>
                <form method="POST" action="">
                    <div class="mb-3">
                        <label class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input type="password" name="password" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" name="login" class="btn btn-login w-100 fw-bold">Login</button>
                </form>
                <p class="text-center mt-3">Don’t have an account?
                    <a href="#" class="toggle-link" onclick="toggleForms()">Register</a>
                </p>
            </div>
        </div>
    </div>
    <!-- Hospital Walk Container -->
    <div class="hospital-container" id="hospital-container">
        <!-- Walking PNGs will spawn here -->

        <!-- FLOOR (paste this inside hospital-container, AFTER PNGs spawn area) -->
        <div class="floor"></div>
    </div>

<script>
document.addEventListener("DOMContentLoaded", () => {
  const alertBox = document.querySelector(".alert");
  if (alertBox) {
    setTimeout(() => {
      alertBox.style.transition = "opacity 0.5s ease";
      alertBox.style.opacity = "0";
      setTimeout(() => alertBox.remove(), 500);
    }, 3000); // 3 seconds
  }
});
</script>

</body>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
    function toggleForms() {
  document.getElementById("loginForm").style.display =
    document.getElementById("loginForm").style.display === "none" ? "block" : "none";
  document.getElementById("registerForm").style.display =
    document.getElementById("registerForm").style.display === "none" ? "block" : "none";
}

function validateRegister(event) {
  event.preventDefault();

  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  toggleForms();
}

function goToDashboard(event) {
  event.preventDefault();
  window.location.href = "\Project in CC105\informationmanagement\Informationmanagement.html";
}

// ---- Hospital Walk Animation ----
const container = document.getElementById("hospital-container");
const maxWalkers = 7;
const walkers = [];
const spacing = 220; // 200px + 20px gap

function getRandomClass() {
  return Math.floor(Math.random() * 19); // 0–18
}

function createWalker(offset = 0) {
  const num = getRandomClass();
  const img = document.createElement("img");
  img.src = `img/patient${num}.png`; // <-- patient images must exist
  img.classList.add("patient-walker");
  img.dataset.index = num;

  img.style.left = (-220 - offset) + "px";
  container.appendChild(img);

  walkers.push(img);
  walkForward(img, num);
}

function walkForward(img, num) {
  const walkInterval = setInterval(() => {
    const currentLeft = parseFloat(img.style.left) || 0;
    img.style.left = (currentLeft + 40) + "px"; // step forward

    // When reaching center -> change into client
    if (currentLeft >= window.innerWidth / 2 - 100 && !img.dataset.converted) {
      img.src = `img/client${num}.png`; // <-- client images must exist
      img.dataset.converted = true;
    }

    // When exiting right side -> remove and respawn
    if (currentLeft > window.innerWidth) {
      clearInterval(walkInterval);
      container.removeChild(img);
      walkers.splice(walkers.indexOf(img), 1);
      createWalker(); // spawn replacement
    }
  }, 1000); // step every 1s
}

// Initialize walkers with spacing
for (let i = 0; i < maxWalkers; i++) {
  setTimeout(() => {
    createWalker(i * spacing);
  }, i * 800);
}

</script>

</html>