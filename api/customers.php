<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $status = $_GET['status'] ?? null;
        $sql = "SELECT c.*, 
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(o.value), 0) as total_spent,
                MAX(o.created_at) as last_order_date
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id";
        
        $params = [];
        if ($status) {
            $sql .= " WHERE c.status = ?";
            $params[] = $status;
        }
        
        $sql .= " GROUP BY c.id ORDER BY c.last_contact DESC LIMIT 100";
        $customers = $db->query($sql, $params);
        echo json_encode(['success' => true, 'data' => $customers, 'count' => count($customers)]);
    }
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO customers (name, email, phone, company, status, source, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $id = $db->execute($sql, [
            $data['name'] ?? '',
            $data['email'] ?? '',
            $data['phone'] ?? '',
            $data['company'] ?? '',
            $data['status'] ?? 'prospect',
            $data['source'] ?? '',
            $data['notes'] ?? ''
        ]);
        echo json_encode(['success' => true, 'id' => $id]);
    }
    else if ($method === 'PUT') {
        parse_str(file_get_contents('php://input'), $data);
        $sql = "UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, status = ?, source = ?, notes = ? WHERE id = ?";
        $db->execute($sql, [
            $data['name'] ?? '',
            $data['email'] ?? '',
            $data['phone'] ?? '',
            $data['company'] ?? '',
            $data['status'] ?? 'prospect',
            $data['source'] ?? '',
            $data['notes'] ?? '',
            $data['id'] ?? 0
        ]);
        echo json_encode(['success' => true]);
    }
    else if ($method === 'DELETE') {
        parse_str(file_get_contents('php://input'), $data);
        $db->execute("DELETE FROM customers WHERE id = ?", [$data['id'] ?? 0]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
