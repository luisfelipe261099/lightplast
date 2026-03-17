<?php
// Router para API - redireciona para o arquivo correto baseado no endpoint
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Extract the endpoint from the path
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathArray = array_filter(explode('/', $path));
$endpoint = end($pathArray);

// Remove .php if it exists
$endpoint = str_replace('.php', '', $endpoint);

// Map of endpoints to files
$routes = [
    'customers' => 'customers.php',
    'leads' => 'leads.php',
    'budgets' => 'budgets.php',
    'orders' => 'orders.php',
    'follow-ups' => 'follow-ups.php',  
    'dashboard' => 'dashboard.php',
    'index' => null,
];

// Check if endpoint exists
if (isset($routes[$endpoint]) && $routes[$endpoint]) {
    include __DIR__ . '/' . $routes[$endpoint];
} else {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
}


