<?php
require 'db_connection.php'; // Include the database connection file

// SQL query to fetch user data - adding password to the query
$sql = "SELECT username, password, country, city, continent, ip_address, login_time FROM users ORDER BY login_time DESC";
$result = $conn->query($sql);

$users = [];

if ($result->num_rows > 0) {
    // Fetch all rows as associative array
    while($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
} else {
    // Don't output here as it breaks the layout
}
$conn->close();

// Return users data as JSON (optional, for API purposes or AJAX)
// header('Content-Type: application/json');
// echo json_encode($users);
?> 