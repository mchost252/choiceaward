<?php
// Use environment variables or a separate config file that's not tracked in git
$servername = getenv("DB_HOST") ?: "192.168.0.100"; 
$username = getenv("DB_USER") ?: "choiceaw_user_db";
$password = getenv("DB_PASS") ?: "56qVqFYMCA6sEZqqab7d"; // Never expose this in GitHub
$dbname = getenv("DB_NAME") ?: "choiceaw_user_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
//echo "Successfully connected to the database"; // Optional success message
?> 
