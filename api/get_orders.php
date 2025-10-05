<?php
include 'database.php';
header("Content-Type: application/json");

$stmt = $conn->prepare("SELECT id, client_name, order_date, floors, submitted_by, status, completed_date, completed_by FROM orders ORDER BY order_date DESC");
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = [
        'id' => $row['id'],
        'clientName' => $row['client_name'],
        'date' => $row['order_date'],
        'floors' => json_decode($row['floors'], true),
        'submittedBy' => $row['submitted_by'],
        'status' => $row['status'],
        'completedDate' => $row['completed_date'],
        'completedBy' => $row['completed_by']
    ];
}

echo json_encode($orders);

$stmt->close();
$conn->close();
?>