<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $sql = "SELECT o.*, c.name as customer_name FROM orders o 
                LEFT JOIN customers c ON o.customer_id = c.id 
                ORDER BY o.created_at DESC LIMIT 100";
        $orders = $db->query($sql);
        echo json_encode(['success' => true, 'data' => $orders]);
    }
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO orders (customer_id, budget_id, value, status) VALUES (?, ?, ?, ?)";
        $id = $db->execute($sql, [
            $data['customer_id'] ?? 0,
            $data['budget_id'] ?? 0,
            $data['value'] ?? 0,
            $data['status'] ?? 'pending'
        ]);
        echo json_encode(['success' => true, 'id' => $id]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
