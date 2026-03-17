<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $sql = "SELECT f.*, c.name as customer_name FROM follow_ups f 
                LEFT JOIN customers c ON f.customer_id = c.id 
                ORDER BY f.scheduled_date ASC";
        $followups = $db->query($sql);
        echo json_encode(['success' => true, 'data' => $followups]);
    }
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO follow_ups (customer_id, type, description, scheduled_date) VALUES (?, ?, ?, ?)";
        $id = $db->execute($sql, [
            $data['customer_id'] ?? 0,
            $data['type'] ?? '',
            $data['description'] ?? '',
            $data['scheduled_date'] ?? date('Y-m-d H:i:s')
        ]);
        echo json_encode(['success' => true, 'id' => $id]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
