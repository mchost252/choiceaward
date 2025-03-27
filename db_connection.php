<?php
$servername = "192.168.0.100"; // Your phpMyAdmin hostname
$username = "choiceaw_user_db"; // Your database username
$password = "56qVqFYMCA6sEZqqab7d"; // Your database password
$dbname = "choiceaw_user_db"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
//echo "Successfully connected to the database"; // Optional success message
?> 