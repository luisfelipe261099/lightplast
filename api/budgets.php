<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

try {
    if ($method === 'GET') {
        if ($id && strpos($_SERVER['REQUEST_URI'], '/pdf') !== false) {
            // PDF generation for budget
            $budgets = $db->query("SELECT * FROM budgets WHERE id = ?", [$id]);
            if (empty($budgets)) {
                throw new Exception("Budget not found");
            }
            
            $budget = $budgets[0];
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="budget_' . $id . '.pdf"');
            
            // Simple PDF generation (text-based)
            $pdf = "ORÇAMENTO #" . $budget['id'] . "\n";
            $pdf .= "Data: " . date('d/m/Y') . "\n\n";
            $pdf .= "Cliente: " . $budget['customer_id'] . "\n";
            $pdf .= "Descrição: " . $budget['description'] . "\n";
            $pdf .= "Valor Total: R$ " . number_format($budget['total_value'], 2, ',', '.') . "\n";
            $pdf .= "Status: " . $budget['status'] . "\n";
            
            echo $pdf;
            return;
        }
        
        $sql = "SELECT b.*, c.name as customer_name FROM budgets b 
                LEFT JOIN customers c ON b.customer_id = c.id 
                ORDER BY b.created_at DESC LIMIT 100";
        $budgets = $db->query($sql);
        echo json_encode(['success' => true, 'data' => $budgets]);
    }
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $items = isset($data['items']) ? json_encode($data['items']) : '[]';
        $sql = "INSERT INTO budgets (customer_id, title, description, items, total_value, status, tax, discount) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $id = $db->execute($sql, [
            $data['customer_id'] ?? 0,
            $data['title'] ?? '',
            $data['description'] ?? '',
            $items,
            $data['total_value'] ?? 0,
            $data['status'] ?? 'draft',
            $data['tax'] ?? 0,
            $data['discount'] ?? 0
        ]);
        echo json_encode(['success' => true, 'id' => $id]);
    }
    else if ($method === 'PUT') {
        parse_str(file_get_contents('php://input'), $data);
        $sql = "UPDATE budgets SET status = ? WHERE id = ?";
        $db->execute($sql, [$data['status'] ?? 'draft', $data['id'] ?? 0]);
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
