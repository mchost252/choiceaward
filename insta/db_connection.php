<?php
$servername = "localhost:3306"; // Host and port
$username = "obinnanjoku2007_user_info_db"; // Database username
$password = "Obinna123123"; // Database password
$dbname = "obinnanjoku2007_user_info_db"; // Database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
//echo "Successfully connected to the database"; // Optional success message
?> 