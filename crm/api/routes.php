<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$conn = require __DIR__ . '/db.php';
$db = new Database();

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', trim($path, '/'));

// API Route: /crm/api/resource/action
$resource = $parts[2] ?? null;
$action = $parts[3] ?? null;
$id = $parts[4] ?? null;

try {

    // CUSTOMERS API
    if ($resource === 'customers') {
        if ($method === 'GET') {
            if ($id) {
                // Get single customer with orders and follow-ups
                $sql = "SELECT c.*, 
                        COUNT(DISTINCT o.id) as total_orders,
                        COALESCE(SUM(o.value), 0) as total_spent
                        FROM customers c
                        LEFT JOIN orders o ON c.id = o.customer_id
                        WHERE c.id = ?
                        GROUP BY c.id";
                $stmt = $db->query($sql, [$id]);
                $customer = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$customer) {
                    throw new Exception('Customer not found', 404);
                }

                // Get orders
                $orders = $db->query(
                    "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
                    [$id]
                )->fetchAll(PDO::FETCH_ASSOC);

                // Get follow-ups
                $followUps = $db->query(
                    "SELECT * FROM follow_ups WHERE customer_id = ? ORDER BY scheduled_date DESC",
                    [$id]
                )->fetchAll(PDO::FETCH_ASSOC);

                // Get interactions
                $interactions = $db->query(
                    "SELECT * FROM interactions WHERE customer_id = ? ORDER BY created_at DESC",
                    [$id]
                )->fetchAll(PDO::FETCH_ASSOC);

                $customer['orders'] = $orders;
                $customer['follow_ups'] = $followUps;
                $customer['interactions'] = $interactions;

                echo json_encode(['success' => true, 'data' => $customer]);
            } else {
                // List all customers with stats
                $status = $_GET['status'] ?? null;
                $sql = "SELECT c.*, 
                        COUNT(DISTINCT o.id) as total_orders,
                        COALESCE(SUM(o.value), 0) as total_spent,
                        (SELECT MAX(created_at) FROM orders WHERE customer_id = c.id) as last_order_date
                        FROM customers c
                        LEFT JOIN orders o ON c.id = o.customer_id";
                
                if ($status) {
                    $sql .= " WHERE c.status = ?";
                    $params = [$status];
                } else {
                    $params = [];
                }

                $sql .= " GROUP BY c.id ORDER BY c.last_contact DESC NULLS LAST";

                $stmt = $db->query($sql, $params);
                $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $customers, 'count' => count($customers)]);
            }
        } else if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $sql = "INSERT INTO customers (name, email, phone, company, document, address, city, state, zip, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $db->query($sql, [
                $data['name'],
                $data['email'] ?? null,
                $data['phone'],
                $data['company'] ?? null,
                $data['document'] ?? null,
                $data['address'] ?? null,
                $data['city'] ?? null,
                $data['state'] ?? null,
                $data['zip'] ?? null,
                'active'
            ]);

            $newId = $db->lastInsertId();
            echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Customer created']);
        } else if ($method === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $sql = "UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, 
                    document = ?, address = ?, city = ?, state = ?, zip = ?, 
                    status = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?";
            
            $db->query($sql, [
                $data['name'],
                $data['email'] ?? null,
                $data['phone'],
                $data['company'] ?? null,
                $data['document'] ?? null,
                $data['address'] ?? null,
                $data['city'] ?? null,
                $data['state'] ?? null,
                $data['zip'] ?? null,
                $data['status'] ?? 'active',
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Customer updated']);
        } else if ($method === 'DELETE') {
            $db->query("DELETE FROM customers WHERE id = ?", [$id]);
            echo json_encode(['success' => true, 'message' => 'Customer deleted']);
        }
    }

    // ORDERS API
    else if ($resource === 'orders') {
        if ($method === 'GET') {
            if ($id) {
                $stmt = $db->query("SELECT * FROM orders WHERE id = ?", [$id]);
                $order = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $order]);
            } else {
                $customerId = $_GET['customer_id'] ?? null;
                $sql = "SELECT * FROM orders WHERE 1=1";
                $params = [];

                if ($customerId) {
                    $sql .= " AND customer_id = ?";
                    $params[] = $customerId;
                }

                $sql .= " ORDER BY created_at DESC";
                $stmt = $db->query($sql, $params);
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $orders, 'count' => count($orders)]);
            }
        } else if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);

            // Update customer lifetime value
            $db->query(
                "UPDATE customers SET lifetime_value = lifetime_value + ? WHERE id = ?",
                [$data['value'], $data['customer_id']]
            );

            $sql = "INSERT INTO orders (customer_id, order_number, product_type, quantity, unit, value, status, description, delivery_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $db->query($sql, [
                $data['customer_id'],
                $data['order_number'] ?? 'ORD-' . date('YmdHis'),
                $data['product_type'] ?? null,
                $data['quantity'] ?? null,
                $data['unit'] ?? null,
                $data['value'],
                'pending',
                $data['description'] ?? null,
                $data['delivery_date'] ?? null
            ]);

            $newId = $db->lastInsertId();
            echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Order created']);
        } else if ($method === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);

            $sql = "UPDATE orders SET status = ?, product_type = ?, quantity = ?, unit = ?, 
                    value = ?, description = ?, delivery_date = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?";

            $db->query($sql, [
                $data['status'] ?? 'pending',
                $data['product_type'] ?? null,
                $data['quantity'] ?? null,
                $data['unit'] ?? null,
                $data['value'] ?? 0,
                $data['description'] ?? null,
                $data['delivery_date'] ?? null,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Order updated']);
        }
    }

    // LEADS API
    else if ($resource === 'leads') {
        if ($method === 'GET') {
            if ($id) {
                $stmt = $db->query("SELECT * FROM leads WHERE id = ?", [$id]);
                $lead = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $lead]);
            } else {
                $status = $_GET['status'] ?? null;
                $sql = "SELECT * FROM leads WHERE 1=1";
                $params = [];

                if ($status) {
                    $sql .= " AND status = ?";
                    $params[] = $status;
                }

                $sql .= " ORDER BY score DESC, created_at DESC";
                $stmt = $db->query($sql, $params);
                $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => $leads, 'count' => count($leads)]);
            }
        } else if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);

            // Calculate lead score based on engagement
            $score = 0;
            if ($data['source'] === 'whatsapp' || $data['source'] === 'direct') $score += 30;
            if ($data['company']) $score += 20;
            if ($data['email']) $score += 10;

            $sql = "INSERT INTO leads (name, email, phone, company, product_interest, source, score, status, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)";

            $db->query($sql, [
                $data['name'],
                $data['email'] ?? null,
                $data['phone'],
                $data['company'] ?? null,
                $data['product_interest'] ?? null,
                $data['source'] ?? 'website',
                $score,
                $data['notes'] ?? null
            ]);

            $newId = $db->lastInsertId();
            echo json_encode(['success' => true, 'id' => $newId, 'score' => $score, 'message' => 'Lead created']);
        } else if ($method === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);

            $sql = "UPDATE leads SET status = ?, score = ?, product_interest = ?, 
                    notes = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?";

            $db->query($sql, [
                $data['status'] ?? 'new',
                $data['score'] ?? 0,
                $data['product_interest'] ?? null,
                $data['notes'] ?? null,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Lead updated']);
        }
    }

    // FOLLOW-UPS API
    else if ($resource === 'follow-ups') {
        if ($method === 'GET') {
            $pending = $_GET['pending'] ?? 0;
            $sql = "SELECT f.*, 
                    COALESCE(c.name, l.name) as contact_name,
                    CASE WHEN f.customer_id IS NOT NULL THEN 'customer' ELSE 'lead' END as contact_type
                    FROM follow_ups f
                    LEFT JOIN customers c ON f.customer_id = c.id
                    LEFT JOIN leads l ON f.lead_id = l.id
                    WHERE 1=1";
            
            $params = [];

            if ($pending) {
                $sql .= " AND f.status = 'pending' AND f.scheduled_date <= datetime('now')";
            }

            $sql .= " ORDER BY f.scheduled_date ASC";

            $stmt = $db->query($sql, $params);
            $followUps = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['success' => true, 'data' => $followUps, 'count' => count($followUps)]);
        } else if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);

            $sql = "INSERT INTO follow_ups (customer_id, lead_id, title, description, scheduled_date, follow_up_type, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'pending')";

            $db->query($sql, [
                $data['customer_id'] ?? null,
                $data['lead_id'] ?? null,
                $data['title'],
                $data['description'] ?? null,
                $data['scheduled_date'],
                $data['follow_up_type'] ?? 'call'
            ]);

            $newId = $db->lastInsertId();
            echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Follow-up scheduled']);
        } else if ($method === 'PUT') {
            $data = json_decode(file_get_contents('php://input'), true);

            $completedAt = ($data['status'] === 'completed') ? 'CURRENT_TIMESTAMP' : 'NULL';

            $sql = "UPDATE follow_ups SET 
                    status = ?, 
                    title = ?, 
                    description = ?, 
                    scheduled_date = ?,
                    notes = ?,
                    completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
                    WHERE id = ?";

            $db->query($sql, [
                $data['status'] ?? 'pending',
                $data['title'] ?? null,
                $data['description'] ?? null,
                $data['scheduled_date'] ?? null,
                $data['notes'] ?? null,
                $data['status'] ?? 'pending',
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Follow-up updated']);
        }
    }

    // DASHBOARD API
    else if ($resource === 'dashboard') {
        $stats = [
            'total_customers' => $db->query("SELECT COUNT(*) as count FROM customers WHERE status = 'active'")->fetch()['count'],
            'total_leads' => $db->query("SELECT COUNT(*) as count FROM leads WHERE status IN ('new', 'qualified')")->fetch()['count'],
            'pending_follow_ups' => $db->query("SELECT COUNT(*) as count FROM follow_ups WHERE status = 'pending' AND scheduled_date <= datetime('now')")->fetch()['count'],
            'total_revenue' => $db->query("SELECT COALESCE(SUM(value), 0) as total FROM orders WHERE status != 'cancelled'")->fetch()['total'],
            'monthly_revenue' => $db->query("SELECT COALESCE(SUM(value), 0) as total FROM orders WHERE status != 'cancelled' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')")->fetch()['total'],
            'conversion_rate' => $db->query("SELECT ROUND(COUNT(CASE WHEN converted_to_customer IS NOT NULL THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as rate FROM leads")->fetch()['rate'] ?? 0,
        ];

        // Recent tasks
        $recentFollowUps = $db->query(
            "SELECT f.*, COALESCE(c.name, l.name) as contact_name 
             FROM follow_ups f
             LEFT JOIN customers c ON f.customer_id = c.id
             LEFT JOIN leads l ON f.lead_id = l.id
             WHERE f.status = 'pending' AND f.scheduled_date <= datetime('now')
             ORDER BY f.scheduled_date ASC LIMIT 5"
        )->fetchAll(PDO::FETCH_ASSOC);

        // Top customers
        $topCustomers = $db->query(
            "SELECT c.id, c.name, c.phone, c.company, SUM(o.value) as total_spent
             FROM customers c
             LEFT JOIN orders o ON c.id = o.customer_id
             GROUP BY c.id
             ORDER BY total_spent DESC LIMIT 5"
        )->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'stats' => $stats,
            'recent_follow_ups' => $recentFollowUps,
            'top_customers' => $topCustomers
        ]);
    }

    else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Resource not found']);
    }

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
