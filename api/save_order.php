<?php
include 'database.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $clientName = $data['clientName'];
    $date = $data['date'];
    $floors = json_encode($data['floors']);
    $submittedBy = $data['submittedBy'];
    
    $stmt = $conn->prepare("INSERT INTO orders (client_name, order_date, floors, submitted_by) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $clientName, $date, $floors, $submittedBy);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Order saved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error saving order']);
    }
    
    $stmt->close();
    $conn->close();
}
?>