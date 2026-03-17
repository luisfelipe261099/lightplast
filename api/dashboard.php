<?php
require_once __DIR__ . '/db.php';

try {
    $totalCustomers = $db->query("SELECT COUNT(*) as count FROM customers");
    $totalLeads = $db->query("SELECT COUNT(*) as count FROM leads WHERE status != 'converted'");
    $totalBudgets = $db->query("SELECT COUNT(*) as count FROM budgets");
    $totalOrders = $db->query("SELECT COUNT(*) as count FROM orders");
    $totalRevenue = $db->query("SELECT COALESCE(SUM(value), 0) as total FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered')");
    $conversionRate = $db->query("SELECT 
        (SELECT COUNT(*) FROM leads WHERE status = 'converted') as converted,
        (SELECT COUNT(*) FROM leads) as total");
    
    echo json_encode([
        'success' => true,
        'data' => [
            'totalCustomers' => $totalCustomers[0]['count'] ?? 0,
            'totalLeads' => $totalLeads[0]['count'] ?? 0,
            'totalBudgets' => $totalBudgets[0]['count'] ?? 0,
            'totalOrders' => $totalOrders[0]['count'] ?? 0,
            'totalRevenue' => (float)($totalRevenue[0]['total'] ?? 0),
            'conversionRate' => ($conversionRate[0]['total'] > 0) ? 
                round(($conversionRate[0]['converted'] / $conversionRate[0]['total']) * 100, 2) : 0
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
