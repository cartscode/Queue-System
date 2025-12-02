<?php
include('config.php');
session_start();

$message = "";
$form_submitted = false;

// Login only
if (isset($_POST['login'])) {
    $form_submitted = true;
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    $result = mysqli_query($conn, "SELECT * FROM users WHERE email='$email'");
    $user = mysqli_fetch_assoc($result);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['email'] = $email;
        header("Location: ../informationmanagement/informationmanagement.php");
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

    <nav class="navbar navbar-expand-lg navbar-custom">
        <div class="container">
            <a class="navbar-brand fw-bold">HealthCare+</a>
            <div class="ms-auto">
                <a href="../home/index.html" class="btn btn-login fw-bold">Back To Home</a>
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

            <!-- LOGIN ONLY -->
            <div id="loginForm">
                <h3>Login</h3>
                <form method="POST" action="">
                    <div class="mb-3">
                        <label class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input type="password" name="password" class="form-control" placeholder="Enter your password"
                            required>
                    </div>
                    <button type="submit" name="login" class="btn btn-login w-100 fw-bold">Login</button>
                </form>
            </div>

        </div>
    </div>

    <div class="hospital-container" id="hospital-container">
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
            }, 3000);
        }
    });
    </script>

</body>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
// Hospital walk animation preserved
const container = document.getElementById("hospital-container");
const maxWalkers = 7;
const walkers = [];
const spacing = 220;

function getRandomClass() {
    return Math.floor(Math.random() * 19);
}

function createWalker(offset = 0) {
    const num = getRandomClass();
    const img = document.createElement("img");
    img.src = `img/patient${num}.png`;
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
        img.style.left = (currentLeft + 40) + "px";

        if (currentLeft >= window.innerWidth / 2 - 100 && !img.dataset.converted) {
            img.src = `img/client${num}.png`;
            img.dataset.converted = true;
        }

        if (currentLeft > window.innerWidth) {
            clearInterval(walkInterval);
            container.removeChild(img);
            walkers.splice(walkers.indexOf(img), 1);
            createWalker();
        }
    }, 1000);
}

for (let i = 0; i < maxWalkers; i++) {
    setTimeout(() => {
        createWalker(i * spacing);
    }, i * 800);
}
</script>
</html>
