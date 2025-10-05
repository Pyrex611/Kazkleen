document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // View toggle functionality
    document.querySelectorAll('.view-toggle').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const viewId = this.getAttribute('data-view');
            
            // Update active link
            document.querySelectorAll('.view-toggle').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected view
            document.getElementById('workerView').classList.remove('active-view');
            document.getElementById('adminView').classList.remove('active-view');
            document.getElementById(viewId).classList.add('active-view');
            
            // If admin view, refresh charts
            if (viewId === 'adminView') {
                updateCharts();
                populateOrdersTable();
            }
        });
    });
    
    // Add row functionality
    document.getElementById('addRow').addEventListener('click', function() {
        const tbody = document.querySelector('#itemsTable tbody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <select class="form-select item-select">
                    <option value="">Select Item</option>
                    <option value="Carpet Cleaning">Carpet Cleaning</option>
                    <option value="Window Cleaning">Window Cleaning</option>
                    <option value="Floor Polishing">Floor Polishing</option>
                    <option value="Upholstery Cleaning">Upholstery Cleaning</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="Office Cleaning">Office Cleaning</option>
                </select>
            </td>
            <td>
                <input type="number" class="form-control quantity" min="1" value="1">
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-sm remove-row">X</button>
            </td>
        `;
        tbody.appendChild(newRow);
        
        // Add event listener to the new remove button
        newRow.querySelector('.remove-row').addEventListener('click', function() {
            if (document.querySelectorAll('#itemsTable tbody tr').length > 1) {
                this.closest('tr').remove();
            } else {
                alert('You need at least one item in the order.');
            }
        });
    });
    
    // Remove row event delegation
    document.querySelector('#itemsTable').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-row')) {
            if (document.querySelectorAll('#itemsTable tbody tr').length > 1) {
                e.target.closest('tr').remove();
            } else {
                alert('You need at least one item in the order.');
            }
        }
    });
    
    // Form submission
    document.getElementById('cleaningForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const clientName = document.getElementById('clientName').value;
        const date = document.getElementById('date').value;
        
        // Validate form
        if (!clientName || !date) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Collect items
        const items = [];
        let isValid = true;
        
        document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
            const itemSelect = row.querySelector('.item-select');
            const quantityInput = row.querySelector('.quantity');
            
            if (!itemSelect.value) {
                isValid = false;
                itemSelect.classList.add('is-invalid');
            } else {
                itemSelect.classList.remove('is-invalid');
                items.push({
                    service: itemSelect.value,
                    quantity: parseInt(quantityInput.value)
                });
            }
        });
        
        if (!isValid) {
            alert('Please select a service for all items.');
            return;
        }
        
        // Save order
        saveOrder(clientName, date, items);
        
        // Reset form
        this.reset();
        // Keep only one row
        const tbody = document.querySelector('#itemsTable tbody');
        while (tbody.children.length > 1) {
            tbody.removeChild(tbody.lastChild);
        }
        
        alert('Order submitted successfully!');
    });
    
    // Refresh data button
    document.getElementById('refreshData').addEventListener('click', function() {
        updateCharts();
        populateOrdersTable();
    });
});

function initApp() {
    // Initialize with sample data if empty
    if (!localStorage.getItem('cleaningOrders')) {
        const sampleData = [
            {
                id: 1,
                clientName: 'Office Building A',
                date: '2023-05-15',
                items: [
                    { service: 'Carpet Cleaning', quantity: 5 },
                    { service: 'Window Cleaning', quantity: 12 }
                ]
            },
            {
                id: 2,
                clientName: 'Retail Store B',
                date: '2023-05-16',
                items: [
                    { service: 'Floor Polishing', quantity: 3 },
                    { service: 'Deep Cleaning', quantity: 1 }
                ]
            },
            {
                id: 3,
                clientName: 'Hotel C',
                date: '2023-05-17',
                items: [
                    { service: 'Upholstery Cleaning', quantity: 8 },
                    { service: 'Office Cleaning', quantity: 2 },
                    { service: 'Window Cleaning', quantity: 15 }
                ]
            }
        ];
        localStorage.setItem('cleaningOrders', JSON.stringify(sampleData));
    }
    
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
}

function saveOrder(clientName, date, items) {
    const orders = JSON.parse(localStorage.getItem('cleaningOrders') || '[]');
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    
    orders.push({
        id: newId,
        clientName,
        date,
        items
    });
    
    localStorage.setItem('cleaningOrders', JSON.stringify(orders));
}

function getOrders() {
    return JSON.parse(localStorage.getItem('cleaningOrders') || '[]');
}

function updateCharts() {
    const orders = getOrders();
    
    // Process data for charts
    const serviceCounts = {};
    const dateCounts = {};
    
    orders.forEach(order => {
        // Count services
        order.items.forEach(item => {
            if (serviceCounts[item.service]) {
                serviceCounts[item.service] += item.quantity;
            } else {
                serviceCounts[item.service] = item.quantity;
            }
        });
        
        // Count orders by date
        if (dateCounts[order.date]) {
            dateCounts[order.date]++;
        } else {
            dateCounts[order.date] = 1;
        }
    });
    
    // Orders over time chart
    const dates = Object.keys(dateCounts).sort();
    const orderCounts = dates.map(d => dateCounts[d]);
    
    const ordersCtx = document.getElementById('ordersChart').getContext('2d');
    if (window.ordersChart) {
        window.ordersChart.destroy();
    }
    window.ordersChart = new Chart(ordersCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Orders per Day',
                data: orderCounts,
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Orders Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Services distribution chart
    const services = Object.keys(serviceCounts);
    const serviceQuantities = services.map(s => serviceCounts[s]);
    
    const servicesCtx = document.getElementById('servicesChart').getContext('2d');
    if (window.servicesChart) {
        window.servicesChart.destroy();
    }
    window.servicesChart = new Chart(servicesCtx, {
        type: 'doughnut',
        data: {
            labels: services,
            datasets: [{
                data: serviceQuantities,
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Service Distribution'
                }
            }
        }
    });
}

function populateOrdersTable() {
    const orders = getOrders();
    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = '';
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display only the 10 most recent orders
    const recentOrders = orders.slice(0, 10);
    
    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format services list
        const servicesList = order.items.map(item => 
            `${item.service} (${item.quantity})`
        ).join(', ');
        
        // Calculate total items
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        row.innerHTML = `
            <td>${order.date}</td>
            <td>${order.clientName}</td>
            <td>${servicesList}</td>
            <td>${totalItems}</td>
        `;
        
        tbody.appendChild(row);
    });
}