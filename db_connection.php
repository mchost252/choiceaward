<?php
$servername = "sql.freedb.tech:3306"; // Host
$username = "freedb_User_info"; // Database username
$password = "@q%bzHy49E7c68X"; // Database password
$dbname = "freedb_user_info_db"; // Database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
//echo "Successfully connected to the database"; // Optional success message
?> 