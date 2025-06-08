-- Internet Banking Database Schema
-- Created for ReactJS/Express application

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS api_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS debt_reminders;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS recipients;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS partner_banks;
DROP TABLE IF EXISTS users;

-- Create Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'employee', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Create Accounts table
CREATE TABLE accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    account_type ENUM('payment') DEFAULT 'payment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_account_number (account_number),
    INDEX idx_user_id (user_id)
);

-- Create Recipients table (saved beneficiaries)
CREATE TABLE recipients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    bank_code VARCHAR(10) DEFAULT 'INTERNAL',
    recipient_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_account_number (account_number)
);

-- Create Partner Banks table
CREATE TABLE partner_banks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bank_code VARCHAR(10) UNIQUE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(255),
    security_type ENUM('RSA', 'PGP') NOT NULL,
    public_key TEXT,
    private_key TEXT,
    secret_key VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_bank_code (bank_code)
);

-- Create Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_account_id INT,
    to_account_id INT,
    transaction_type ENUM('transfer_internal', 'transfer_external', 'deposit', 'debt_payment') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    fee_payer ENUM('sender', 'receiver') DEFAULT 'sender',
    content TEXT,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    bank_code VARCHAR(10) DEFAULT 'INTERNAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    INDEX idx_from_account (from_account_id),
    INDEX idx_to_account (to_account_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create Debt Reminders table
CREATE TABLE debt_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    creditor_id INT NOT NULL,
    debtor_account_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    content TEXT,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancel_reason TEXT,
    
    FOREIGN KEY (creditor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (debtor_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    INDEX idx_creditor (creditor_id),
    INDEX idx_debtor (debtor_account_id),
    INDEX idx_status (status)
);

-- Create OTP Codes table
CREATE TABLE otp_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('transfer', 'debt_payment', 'password_reset') NOT NULL,
    reference_id VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_code (code),
    INDEX idx_expires_at (expires_at)
);

-- Create Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('debt_reminder', 'debt_payment', 'debt_cancelled', 'transfer_received') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read)
);

-- Create Refresh Tokens table
CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);

-- Create API Logs table
CREATE TABLE api_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    partner_bank_id INT,
    request_type ENUM('account_info', 'deposit_money') NOT NULL,
    request_data TEXT,
    response_data TEXT,
    status ENUM('success', 'failed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signature VARCHAR(500),
    
    FOREIGN KEY (partner_bank_id) REFERENCES partner_banks(id) ON DELETE SET NULL,
    INDEX idx_partner_bank (partner_bank_id),
    INDEX idx_request_type (request_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Insert sample data
-- Create admin user
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@bank.com', '$2b$10$example_hash', 'Administrator', 'admin');

-- Create employee user
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('employee1', 'employee1@bank.com', '$2b$10$example_hash', 'Nguyễn Văn A', 'employee');

-- Create sample customers (8 accounts as required)
INSERT INTO users (username, email, password_hash, full_name, phone) VALUES
('customer1', 'customer1@gmail.com', '$2b$10$example_hash', 'Trần Văn B', '0901234567'),
('customer2', 'customer2@gmail.com', '$2b$10$example_hash', 'Lê Thị C', '0901234568'),
('customer3', 'customer3@gmail.com', '$2b$10$example_hash', 'Phạm Văn D', '0901234569'),
('customer4', 'customer4@gmail.com', '$2b$10$example_hash', 'Hoàng Thị E', '0901234570'),
('customer5', 'customer5@gmail.com', '$2b$10$example_hash', 'Vũ Văn F', '0901234571'),
('customer6', 'customer6@gmail.com', '$2b$10$example_hash', 'Đỗ Thị G', '0901234572'),
('customer7', 'customer7@gmail.com', '$2b$10$example_hash', 'Bùi Văn H', '0901234573'),
('customer8', 'customer8@gmail.com', '$2b$10$example_hash', 'Ngô Thị I', '0901234574');

-- Create payment accounts for customers
INSERT INTO accounts (user_id, account_number, balance) VALUES
(3, '1001000001', 5000000.00),
(4, '1001000002', 3500000.00),
(5, '1001000003', 7200000.00),
(6, '1001000004', 2800000.00),
(7, '1001000005', 4600000.00),
(8, '1001000006', 6100000.00),
(9, '1001000007', 3900000.00),
(10, '1001000008', 5800000.00);

-- Create sample partner banks
INSERT INTO partner_banks (bank_code, bank_name, security_type, is_active) VALUES
('VCB', 'Vietcombank', 'RSA', TRUE),
('TCB', 'Techcombank', 'PGP', TRUE);

-- Create sample transactions (8+ transactions for each account)
INSERT INTO transactions (from_account_id, to_account_id, transaction_type, amount, content, status, completed_at) VALUES
-- Deposits
(NULL, 1, 'deposit', 1000000.00, 'Nạp tiền đầu kỳ', 'completed', NOW()),
(NULL, 2, 'deposit', 500000.00, 'Nạp tiền đầu kỳ', 'completed', NOW()),
(NULL, 3, 'deposit', 2000000.00, 'Nạp tiền đầu kỳ', 'completed', NOW()),

-- Internal transfers
(1, 2, 'transfer_internal', 200000.00, 'Chuyển tiền mua hàng', 'completed', NOW()),
(2, 3, 'transfer_internal', 150000.00, 'Trả nợ', 'completed', NOW()),
(3, 1, 'transfer_internal', 300000.00, 'Chuyển tiền gia đình', 'completed', NOW()),
(1, 4, 'transfer_internal', 100000.00, 'Góp quỹ lớp', 'completed', NOW()),
(4, 5, 'transfer_internal', 250000.00, 'Mua hàng online', 'completed', NOW()),
(5, 6, 'transfer_internal', 180000.00, 'Trả tiền ăn', 'completed', NOW()),
(6, 7, 'transfer_internal', 220000.00, 'Chuyển tiền thuê nhà', 'completed', NOW()),
(7, 8, 'transfer_internal', 160000.00, 'Mua quà sinh nhật', 'completed', NOW()),
(8, 1, 'transfer_internal', 190000.00, 'Hoàn tiền', 'completed', NOW()),

-- More transactions to meet requirement (8+ per account)
(2, 4, 'transfer_internal', 120000.00, 'Chuyển tiền học phí', 'completed', NOW()),
(3, 5, 'transfer_internal', 280000.00, 'Mua sách', 'completed', NOW()),
(4, 6, 'transfer_internal', 95000.00, 'Trả tiền cafe', 'completed', NOW()),
(5, 7, 'transfer_internal', 175000.00, 'Mua đồ ăn', 'completed', NOW()),
(6, 8, 'transfer_internal', 205000.00, 'Chuyển tiền mẹ', 'completed', NOW()),
(7, 1, 'transfer_internal', 135000.00, 'Trả nợ', 'completed', NOW()),
(8, 2, 'transfer_internal', 155000.00, 'Mua vé xem phim', 'completed', NOW()),
(1, 3, 'transfer_internal', 245000.00, 'Góp tiền du lịch', 'completed', NOW());

-- Create sample recipients
INSERT INTO recipients (user_id, account_number, recipient_name, nickname) VALUES
(3, '1001000002', 'Lê Thị C', 'Chị C'),
(3, '1001000003', 'Phạm Văn D', 'Anh D'),
(4, '1001000001', 'Trần Văn B', 'Anh B'),
(4, '1001000004', 'Hoàng Thị E', 'Chị E');

-- Create sample debt reminders
INSERT INTO debt_reminders (creditor_id, debtor_account_id, amount, content, status) VALUES
(3, 2, 500000.00, 'Tiền ăn tháng 11', 'pending'),
(4, 3, 300000.00, 'Tiền mua hàng chung', 'pending'),
(5, 1, 200000.00, 'Tiền taxi', 'paid');

-- Create sample notifications
INSERT INTO notifications (user_id, type, title, content) VALUES
(3, 'transfer_received', 'Nhận chuyển khoản', 'Bạn đã nhận 200,000 VND từ Trần Văn B'),
(4, 'debt_reminder', 'Nhắc nợ mới', 'Lê Thị C đã gửi nhắc nợ 500,000 VND'),
(5, 'transfer_received', 'Nhận chuyển khoản', 'Bạn đã nhận 150,000 VND từ Lê Thị C');

-- Add triggers for automatic account number generation
DELIMITER //
CREATE TRIGGER generate_account_number 
BEFORE INSERT ON accounts 
FOR EACH ROW 
BEGIN 
    IF NEW.account_number IS NULL OR NEW.account_number = '' THEN
        SET NEW.account_number = CONCAT('100100', LPAD(NEW.user_id, 4, '0'));
    END IF;
END//
DELIMITER ;

-- Add trigger to update balance after transactions
DELIMITER //
CREATE TRIGGER update_balance_after_transaction
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Deduct from sender account
        IF NEW.from_account_id IS NOT NULL THEN
            UPDATE accounts 
            SET balance = balance - NEW.amount - (CASE WHEN NEW.fee_payer = 'sender' THEN NEW.fee ELSE 0 END)
            WHERE id = NEW.from_account_id;
        END IF;
        
        -- Add to receiver account
        IF NEW.to_account_id IS NOT NULL THEN
            UPDATE accounts 
            SET balance = balance + NEW.amount - (CASE WHEN NEW.fee_payer = 'receiver' THEN NEW.fee ELSE 0 END)
            WHERE id = NEW.to_account_id;
        END IF;
    END IF;
END//
DELIMITER ;bankingappdb