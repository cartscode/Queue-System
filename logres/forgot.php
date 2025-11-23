<?php 
include('config.php'); 
$step = 1; 
$message = ""; 

if (isset($_POST['check_email'])) { 
    $email = trim($_POST['email']); 
    $result = mysqli_query($conn, "SELECT * FROM users WHERE email='$email'"); 
    $user = mysqli_fetch_assoc($result); 
    if ($user) { 
        $step = 2; 
        $question = $user['recovery_question']; 
    } else { 
        $message = "No account found."; 
    } 
} 

if (isset($_POST['check_answer'])) { 
    $email = $_POST['email']; 
    $answer = trim($_POST['answer']); 
    $result = mysqli_query($conn, "SELECT * FROM users WHERE email='$email'"); 
    $user = mysqli_fetch_assoc($result); 
    if ($user && password_verify($answer, $user['recovery_answer'])) { 
        $step = 3; 
    } else { 
        $message = "Incorrect answer."; 
    } 
} 

if (isset($_POST['reset_pass'])) { 
    $email = $_POST['email']; 
    $new = trim($_POST['new_pass']); 
    $hashed = password_hash($new, PASSWORD_DEFAULT); 
    mysqli_query($conn, "UPDATE users SET password='$hashed' WHERE email='$email'"); 
    header("Location: login.php?reset=success"); 
    exit; 
} 
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Forgot Password</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
body {
    background: linear-gradient(135deg, #4f4ba2, #19183b, #030213);
    background-size: 400% 400%;
}

.auth-wrapper {
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
}

.auth-card {
    max-width: 420px;
    width: 100%;
    padding: 2rem;
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.auth-card h3 {
    margin-bottom: 1.5rem;
    font-weight: 600;
}

.btn-login {
    background-color: #A1C2BD;
    color: #19183B;
    border-radius: 5px;
    padding: 0.5rem 1.5rem;
    margin-bottom: 0.5rem;
}

.btn-login:hover {
    color: white;
    background-color: #507c76;
}

input.form-control {
    margin-bottom: 1rem;
}

.alert {
    margin-bottom: 1rem;
}

.back-links {
    margin-top: 1rem;
    font-size: 0.9rem;
}

.back-links a {
    color: #155dfc;
    text-decoration: none;
    margin: 0 0.5rem;
}

.back-links a:hover {
    text-decoration: underline;
}
</style>
</head>
<body>

<div class="auth-wrapper">
    <div class="auth-card">
        <h3>Forgot Password</h3>

        <?php if (!empty($message)): ?>
            <div class="alert alert-danger"><?php echo $message; ?></div>
        <?php endif; ?>

        <?php if ($step == 1): ?>
            <form method="POST">
                <input type="email" name="email" class="form-control" placeholder="Enter your email" required>
                <button type="submit" name="check_email" class="btn btn-login w-100">Next</button>
            </form>
        <?php elseif ($step == 2): ?>
            <form method="POST">
                <p><?php echo htmlspecialchars($question); ?></p>
                <input type="hidden" name="email" value="<?php echo htmlspecialchars($email); ?>">
                <input type="text" name="answer" class="form-control" placeholder="Your Answer" required>
                <button type="submit" name="check_answer" class="btn btn-login w-100">Next</button>
            </form>
        <?php elseif ($step == 3): ?>
            <form method="POST">
                <input type="hidden" name="email" value="<?php echo htmlspecialchars($email); ?>">
                <input type="password" name="new_pass" class="form-control" placeholder="New Password" required>
                <button type="submit" name="reset_pass" class="btn btn-login w-100">Reset Password</button>
            </form>
        <?php endif; ?>

        <div class="back-links">
            <a href="login.php">Back to Login</a> | 
            <a href="/home/index.html">Back to Home</a>
        </div>
    </div>
</div>

</body>
</html>
