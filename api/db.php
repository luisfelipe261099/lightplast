<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Load environment variables from .env file (local) or use $_ENV (Vercel)
$env_file = __DIR__ . '/../.env';
if (file_exists($env_file)) {
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (!isset($_ENV[$key])) {
                $_ENV[$key] = $value;
            }
        }
    }
}

// Database Connection
class Database {
    private $conn;
    
    public function __construct() {
        try {
            // Get credentials from environment variables
            $host = $_ENV['TIDB_HOST'] ?? getenv('TIDB_HOST') ?? '';
            $port = $_ENV['TIDB_PORT'] ?? getenv('TIDB_PORT') ?? 4000;
            $user = $_ENV['TIDB_USER'] ?? getenv('TIDB_USER') ?? '';
            $password = $_ENV['TIDB_PASSWORD'] ?? getenv('TIDB_PASSWORD') ?? '';
            $database = $_ENV['TIDB_DATABASE'] ?? getenv('TIDB_DATABASE') ?? '';
            
            // Validate credentials
            if (empty($host) || empty($user) || empty($password) || empty($database)) {
                throw new Exception("Missing database credentials. Check environment variables.");
            }
            
            // Connect to database
            $this->conn = new mysqli($host, $user, $password, $database, (int)$port);
            
            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
            
            $this->conn->set_charset("utf8mb4");
        } catch (Exception $e) {
            http_response_code(500);
            die(json_encode(['success' => false, 'error' => $e->getMessage()]));
        }
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->conn->error);
            }
            
            if (!empty($params)) {
                $types = str_repeat('s', count($params));
                $stmt->bind_param($types, ...$params);
            }
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $result = $stmt->get_result();
            return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
        } catch (Exception $e) {
            http_response_code(500);
            die(json_encode(['success' => false, 'error' => $e->getMessage()]));
        }
    }
    
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->conn->error);
            }
            
            if (!empty($params)) {
                $types = str_repeat('s', count($params));
                $stmt->bind_param($types, ...$params);
            }
            
            if (!$stmt->execute()) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            return $this->conn->insert_id ?: $stmt->affected_rows;
        } catch (Exception $e) {
            http_response_code(500);
            die(json_encode(['success' => false, 'error' => $e->getMessage()]));
        }
    }
    
    public function close() {
        $this->conn->close();
    }
}

// Global database instance
$db = new Database();
