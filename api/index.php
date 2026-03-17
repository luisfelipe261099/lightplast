<?php
// Router para API - redireciona para o arquivo correto baseado no endpoint

// Suppress errors before headers are sent
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Extract the endpoint from the path
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathArray = array_filter(explode('/', $path));
$endpoint = end($pathArray);

// Remove .php if it exists (handle both /api/customers and /api/customers.php)
$endpoint = str_replace('.php', '', $endpoint);
$endpoint = $endpoint ?: 'index';

// Map of endpoints to files
$routes = [
    'customers' => 'customers.php',
    'leads' => 'leads.php',
    'budgets' => 'budgets.php',
    'orders' => 'orders.php',
    'follow-ups' => 'follow-ups.php',
    'dashboard' => 'dashboard.php',
];

// Check if endpoint exists
if (isset($routes[$endpoint])) {
    include __DIR__ . '/' . $routes[$endpoint];
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Endpoint not found: ' . $endpoint]);
}

