<?php
include 'database.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $orderId = $data['orderId'];
    $completedBy = $data['completedBy'];
    
    $stmt = $conn->prepare("UPDATE orders SET status = 'completed', completed_date = CURDATE(), completed_by = ? WHERE id = ?");
    $stmt->bind_param("si", $completedBy, $orderId);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Order marked as completed']);
    } else {
        echo json_encode(['success' false, 'message' => 'Error updating order']);
    }
    
    $stmt->close();
    $conn->close();
}
?>