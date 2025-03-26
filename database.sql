-- Create a database if it doesn't exist
CREATE DATABASE IF NOT EXISTS user_info_db;

-- Use the database
USE user_info_db;

-- Create a table to store user information if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    city VARCHAR(255),
    continent VARCHAR(255),
    ip_address VARCHAR(20),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 