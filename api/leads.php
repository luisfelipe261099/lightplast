<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $sql = "SELECT l.*, c.name as customer_name FROM leads l 
                LEFT JOIN customers c ON l.customer_id = c.id 
                ORDER BY l.created_at DESC LIMIT 100";
        $leads = $db->query($sql);
        echo json_encode(['success' => true, 'data' => $leads]);
    }
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO leads (customer_id, title, description, value, status, priority) VALUES (?, ?, ?, ?, ?, ?)";
        $id = $db->execute($sql, [
            $data['customer_id'] ?? 0,
            $data['title'] ?? '',
            $data['description'] ?? '',
            $data['value'] ?? 0,
            $data['status'] ?? 'open',
            $data['priority'] ?? 'medium'
        ]);
        echo json_encode(['success' => true, 'id' => $id]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
