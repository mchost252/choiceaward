<?php
session_start();

// Define the admin password
$admin_password = "YourSecurePassword123"; // Change this to your desired password

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $submitted_password = isset($_POST['password']) ? $_POST['password'] : '';
    
    if ($submitted_password === $admin_password) {
        // Set session to indicate user is logged in
        $_SESSION['admin_authenticated'] = true;
        
        // Redirect to user database
        header("Location: user_database.php");
        exit;
    } else {
        $error_message = "Incorrect password. Please try again.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="database_styles.css">
    <style>
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            padding: 30px;
            background-color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .login-header i {
            font-size: 48px;
            color: var(--primary);
            margin-bottom: 15px;
        }
        
        .login-form input {
            width: 100%;
            padding: 12px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .login-button {
            width: 100%;
            padding: 12px;
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .login-button:hover {
            background-color: var(--primary-dark);
        }
        
        .error-message {
            color: var(--danger);
            margin-bottom: 15px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <i class="fas fa-lock"></i>
            <h2>Admin Login</h2>
            <p>Enter your password to access the database</p>
        </div>
        
        <?php if (isset($error_message)): ?>
            <div class="error-message">
                <?php echo $error_message; ?>
            </div>
        <?php endif; ?>
        
        <form class="login-form" method="POST" action="">
            <input type="password" name="password" placeholder="Enter password" required>
            <button type="submit" class="login-button">Login</button>
        </form>
    </div>
</body>
</html> 