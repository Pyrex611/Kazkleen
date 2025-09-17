// Centralized data storage simulation (would be SQL in production)
const CENTRAL_STORAGE_KEY = 'kazkleenCRMData';

// Initialize central storage if it doesn't exist
function initCentralStorage() {
    if (!localStorage.getItem(CENTRAL_STORAGE_KEY)) {
        const initialData = {
            orders: [
                {
                    id: 1,
                    clientName: 'Office Building A',
                    date: new Date().toISOString().split('T')[0],
                    floors: [
                        {
                            name: "Ground Floor",
                            rooms: [
                                {
                                    name: "Reception",
                                    items: [
                                        { service: 'Carpet Cleaning', quantity: 1 },
                                        { service: 'Window Cleaning', quantity: 3 }
                                    ]
                                },
                                {
                                    name: "Conference Room",
                                    items: [
                                        { service: 'Floor Polishing', quantity: 1 },
                                        { service: 'Upholstery Cleaning', quantity: 8 }
                                    ]
                                }
                            ]
                        }
                    ],
                    submittedBy: 'worker',
                    status: 'active'
                },
                {
                    id: 2,
                    clientName: 'Retail Store B',
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                    floors: [
                        {
                            name: "First Floor",
                            rooms: [
                                {
                                    name: "Sales Floor",
                                    items: [
                                        { service: 'Deep Cleaning', quantity: 2 },
                                        { service: 'Window Cleaning', quantity: 5 }
                                    ]
                                }
                            ]
                        }
                    ],
                    submittedBy: 'worker',
                    status: 'active'
                }
            ],
            users: [
                { username: 'worker', password: 'worker123', role: 'worker' },
                { username: 'admin', password: 'admin123', role: 'manager' }
            ],
            tables: []
        };
        localStorage.setItem(CENTRAL_STORAGE_KEY, JSON.stringify(initialData));
    }
    return JSON.parse(localStorage.getItem(CENTRAL_STORAGE_KEY));
}

// Get all data from central storage
function getCentralData() {
    return JSON.parse(localStorage.getItem(CENTRAL_STORAGE_KEY) || '{}');
}

// Save data to central storage
function saveToCentralData(data) {
    localStorage.setItem(CENTRAL_STORAGE_KEY, JSON.stringify(data));
}

// Add a new order to central storage
function addOrderToCentralStorage(order) {
    const data = getCentralData();
    if (!data.orders) data.orders = [];
    
    // Generate a unique ID
    const newId = data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1;
    order.id = newId;
    order.status = 'active';
    
    data.orders.push(order);
    saveToCentralData(data);
    return order;
}

// Get all orders from central storage
function getOrdersFromCentralStorage() {
    const data = getCentralData();
    return data.orders || [];
}

// Floor and room management
let floorCounter = 0;
let roomCounter = 0;

function addFloor() {
    floorCounter++;
    const floorId = `floor-${floorCounter}`;
    const floorHTML = `
        <div class="floor-card" id="${floorId}">
            <div class="floor-header">
                <div>
                    <i class="fas fa-building collapsible-icon"></i>
                    <input type="text" class="form-control form-control-sm d-inline-block w-auto" value="Floor ${floorCounter}" placeholder="Floor name">
                </div>
                <div class="floor-actions">
                    <button type="button" class="btn btn-sm btn-info add-room-btn btn-glossy">
                        <i class="fas fa-plus"></i> Add Room
                    </button>
                    <button type="button" class="btn btn-sm btn-danger remove-floor-btn btn-glossy">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="floor-content">
                <div class="rooms-container">
                    <!-- Rooms will be added here -->
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('floorsContainer').insertAdjacentHTML('beforeend', floorHTML);
    
    // Add event listeners for the new floor
    const floorElement = document.getElementById(floorId);
    floorElement.querySelector('.add-room-btn').addEventListener('click', function() {
        addRoom(floorId);
    });
    
    floorElement.querySelector('.remove-floor-btn').addEventListener('click', function() {
        floorElement.remove();
    });
    
    // Add a room by default when adding a floor
    addRoom(floorId);
}

function addRoom(floorId) {
    roomCounter++;
    const roomId = `room-${roomCounter}`;
    const roomHTML = `
        <div class="room-card" id="${roomId}">
            <div class="room-header">
                <div>
                    <i class="fas fa-door-open collapsible-icon"></i>
                    <input type="text" class="form-control form-control-sm d-inline-block w-auto" value="Room ${roomCounter}" placeholder="Room name">
                </div>
                <div class="room-actions">
                    <button type="button" class="btn btn-sm btn-info add-service-btn btn-glossy">
                        <i class="fas fa-plus"></i> Add Service
                    </button>
                    <button type="button" class="btn btn-sm btn-danger remove-room-btn btn-glossy">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="room-content">
                <table class="table table-sm table-rounded">
                    <thead>
                        <tr>
                            <th width="60%">Service</th>
                            <th width="30%">Quantity</th>
                            <th width="10%">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select class="form-select form-select-sm item-select">
                                    <option value="">Select Service</option>
                                    <option value="Carpet Cleaning">Carpet Cleaning</option>
                                    <option value="Window Cleaning">Window Cleaning</option>
                                    <option value="Floor Polishing">Floor Polishing</option>
                                    <option value="Upholstery Cleaning">Upholstery Cleaning</option>
                                    <option value="Deep Cleaning">Deep Cleaning</option>
                                    <option value="Office Cleaning">Office Cleaning</option>
                                </select>
                            </td>
                            <td>
                                <input type="number" class="form-control form-control-sm quantity" min="1" value="1">
                            </td>
                            <td>
                                <button type="button" class="btn btn-sm btn-danger remove-service-btn btn-glossy">X</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    const floorElement = document.getElementById(floorId);
    floorElement.querySelector('.rooms-container').insertAdjacentHTML('beforeend', roomHTML);
    
    // Add event listeners for the new room
    const roomElement = document.getElementById(roomId);
    roomElement.querySelector('.add-service-btn').addEventListener('click', function() {
        addServiceRow(roomId);
    });
    
    roomElement.querySelector('.remove-room-btn').addEventListener('click', function() {
        roomElement.remove();
    });
    
    // Add event listener for the remove service button
    roomElement.querySelector('.remove-service-btn').addEventListener('click', function() {
        if (roomElement.querySelectorAll('.remove-service-btn').length > 1) {
            this.closest('tr').remove();
        } else {
            alert('You need at least one service in the room.');
        }
    });
}

function addServiceRow(roomId) {
    const roomElement = document.getElementById(roomId);
    const tbody = roomElement.querySelector('tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <select class="form-select form-select-sm item-select">
                <option value="">Select Service</option>
                <option value="Carpet Cleaning">Carpet Cleaning</option>
                <option value="Window Cleaning">Window Cleaning</option>
                <option value="Floor Polishing">Floor Polishing</option>
                <option value="Upholstery Cleaning">Upholstery Cleaning</option>
                <option value="Deep Cleaning">Deep Cleaning</option>
                <option value="Office Cleaning">Office Cleaning</option>
            </select>
        </td>
        <td>
            <input type="number" class="form-control form-select-sm quantity" min="1" value="1">
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-danger remove-service-btn btn-glossy">X</button>
        </td>
    `;
    tbody.appendChild(newRow);
    
    // Add event listener to the new remove button
    newRow.querySelector('.remove-service-btn').addEventListener('click', function() {
        if (roomElement.querySelectorAll('.remove-service-btn').length > 1) {
            this.closest('tr').remove();
        } else {
            alert('You need at least one service in the room.');
        }
    });
}

// Export table as JPG
function exportTableAsJPG(orderId) {
    const order = getOrdersFromCentralStorage().find(o => o.id == orderId);
    if (!order) return;
    
    // Create a printable element
    const printableElement = document.createElement('div');
    printableElement.style.backgroundColor = 'white';
    printableElement.style.color = 'black';
    printableElement.style.padding = '20px';
    printableElement.style.maxWidth = '800px';
    printableElement.style.margin = '0 auto';
    
    // Add logo and header
    printableElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #000; margin-bottom: 10px;">Kazkleen</h1>
            <h2 style="color: #333;">Cleaning Project Overview</h2>
            <hr>
        </div>
        <div style="margin-bottom: 20px;">
            <h3>Client: ${order.clientName}</h3>
            <p><strong>Date:</strong> ${order.date}</p>
            <p><strong>Submitted by:</strong> ${order.submittedBy}</p>
        </div>
    `;
    
    // Add order details
    order.floors.forEach(floor => {
        printableElement.innerHTML += `
            <div style="margin-bottom: 15px;">
                <h4>${floor.name}</h4>
        `;
        
        floor.rooms.forEach(room => {
            printableElement.innerHTML += `
                <div style="margin-left: 20px; margin-bottom: 10px;">
                    <h5>${room.name}</h5>
                    <ul>
            `;
            
            room.items.forEach(item => {
                printableElement.innerHTML += `<li>${item.service} (Quantity: ${item.quantity})</li>`;
            });
            
            printableElement.innerHTML += `
                    </ul>
                </div>
            `;
        });
        
        printableElement.innerHTML += `</div>`;
    });
    
    // Add completion section if completed
    if (order.status === 'completed') {
        printableElement.innerHTML += `
            <div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc;">
                <h3>Project Completion</h3>
                <p><strong>Completed on:</strong> ${order.completedDate}</p>
                <p><strong>Completed by:</strong> ${order.completedBy || 'Manager'}</p>
            </div>
        `;
    }
    
    // Add to document temporarily
    printableElement.style.position = 'absolute';
    printableElement.style.left = '-9999px';
    document.body.appendChild(printableElement);
    
    // Use html2canvas to capture the element
    html2canvas(printableElement).then(canvas => {
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/jpeg');
        
        // Create download link
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Kazkleen_Project_${order.clientName}_${order.date}.jpg`;
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(printableElement);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initCentralStorage();
    
    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const data = getCentralData();
        
        // Check if user exists
        const user = data.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Set current user
            localStorage.setItem('currentUser', JSON.stringify(user));
            document.getElementById('navbarUsername').textContent = user.username;
            
            // Show appropriate view based on role
            document.getElementById('loginView').classList.remove('active-view');
            
            if (user.role === 'worker') {
                document.getElementById('workerView').classList.add('active-view');
                // Add a default floor when page loads
                addFloor();
            } else if (user.role === 'manager') {
                document.getElementById('adminView').classList.add('active-view');
                updateDashboard();
                loadUsersList();
            }
        } else {
            alert('Invalid credentials. Please try again.');
        }
    });
    
    // Logout functionality
    document.getElementById('navbarLogoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        document.getElementById('workerView').classList.remove('active-view');
        document.getElementById('adminView').classList.remove('active-view');
        document.getElementById('loginView').classList.add('active-view');
        document.getElementById('loginForm').reset();
        // Clear floors container
        document.getElementById('floorsContainer').innerHTML = '';
    });
    
    // Add floor button
    document.getElementById('addFloorBtn').addEventListener('click', function() {
        addFloor();
    });
    
    // Create order button (for managers)
    document.getElementById('createOrderBtn').addEventListener('click', function() {
        // Switch to worker view to create a new order
        document.getElementById('adminView').classList.remove('active-view');
        document.getElementById('workerView').classList.add('active-view');
        // Add a default floor
        addFloor();
    });
    
    // User form submission
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('userRole').value;
        
        // Save user to central storage
        const data = getCentralData();
        const userExists = data.users.find(u => u.username === username);
        
        if (userExists) {
            alert('Username already exists. Please choose a different username.');
            return;
        }
        
        data.users.push({
            username: username,
            password: password,
            role: role
        });
        
        saveToCentralData(data);
        
        // Show success message and reload users list
        alert('User created successfully!');
        loadUsersList();
        
        // Reset form
        this.reset();
    });
    
    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        document.getElementById('navbarUsername').textContent = currentUser.username;
        
        if (currentUser.role === 'worker') {
            document.getElementById('loginView').classList.remove('active-view');
            document.getElementById('workerView').classList.add('active-view');
            // Add a default floor when page loads
            addFloor();
        } else if (currentUser.role === 'manager') {
            document.getElementById('loginView').classList.remove('active-view');
            document.getElementById('adminView').classList.add('active-view');
            updateDashboard();
            loadUsersList();
        }
    }
    
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
        
        // Collect floors data
        const floors = [];
        const floorElements = document.querySelectorAll('.floor-card');
        
        if (floorElements.length === 0) {
            alert('Please add at least one floor.');
            return;
        }
        
        let isValid = true;
        
        floorElements.forEach(floorElement => {
            const floorName = floorElement.querySelector('.floor-header input').value || 'Unnamed Floor';
            const rooms = [];
            
            const roomElements = floorElement.querySelectorAll('.room-card');
            if (roomElements.length === 0) {
                isValid = false;
                alert('Each floor must have at least one room.');
                return;
            }
            
            roomElements.forEach(roomElement => {
                const roomName = roomElement.querySelector('.room-header input').value || 'Unnamed Room';
                const items = [];
                
                const serviceRows = roomElement.querySelectorAll('tbody tr');
                serviceRows.forEach(row => {
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
                
                if (items.length === 0) {
                    isValid = false;
                    alert(`Room "${roomName}" must have at least one service.`);
                    return;
                }
                
                rooms.push({
                    name: roomName,
                    items: items
                });
            });
            
            if (!isValid) return;
            
            floors.push({
                name: floorName,
                rooms: rooms
            });
        });
        
        if (!isValid) return;
        
        // Get current user
        const user = JSON.parse(localStorage.getItem('currentUser'));
        
        // Save order to central storage
        addOrderToCentralStorage({
            clientName,
            date,
            floors,
            submittedBy: user.username
        });
        
        // Reset form
        this.reset();
        // Clear floors container
        document.getElementById('floorsContainer').innerHTML = '';
        
        // If manager, return to admin view, otherwise stay on worker view
        if (user.role === 'manager') {
            document.getElementById('workerView').classList.remove('active-view');
            document.getElementById('adminView').classList.add('active-view');
            updateDashboard();
        } else {
            // Add a default floor for next order
            addFloor();
        }
        
        alert('Order submitted successfully!');
    });
    
    // Refresh data button
    document.getElementById('refreshData').addEventListener('click', function() {
        updateDashboard();
    });
    
    // Export data button
    document.getElementById('exportData').addEventListener('click', function() {
        exportDataToCSV();
    });
});

function loadUsersList() {
    const data = getCentralData();
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    data.users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'd-flex justify-content-between align-items-center mb-2 p-2 bg-dark rounded';
        userElement.innerHTML = `
            <div>
                <strong>${user.username}</strong> (${user.role})
            </div>
            <div>
                <button class="btn btn-sm btn-warning change-password-btn btn-glossy" data-username="${user.username}">
                    <i class="fas fa-key"></i> Change Password
                </button>
                <button class="btn btn-sm btn-danger delete-user-btn btn-glossy" data-username="${user.username}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        usersList.appendChild(userElement);
        
        // Add event listeners
        userElement.querySelector('.change-password-btn').addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            changePassword(username);
        });
        
        userElement.querySelector('.delete-user-btn').addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            deleteUser(username);
        });
    });
}

function changePassword(username) {
    const newPassword = prompt(`Enter new password for ${username}:`);
    if (newPassword) {
        const data = getCentralData();
        const user = data.users.find(u => u.username === username);
        
        if (user) {
            user.password = newPassword;
            saveToCentralData(data);
            alert('Password changed successfully!');
            loadUsersList();
        }
    }
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user ${username}?`)) {
        const data = getCentralData();
        data.users = data.users.filter(u => u.username !== username);
        saveToCentralData(data);
        alert('User deleted successfully!');
        loadUsersList();
    }
}

function updateDashboard() {
    updateCharts();
    populateOrdersTable();
    updateStats();
}

function updateStats() {
    const orders = getOrdersFromCentralStorage();
    
    // Calculate stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    let totalServices = 0;
    let uniqueClients = new Set();
    orders.forEach(order => {
        uniqueClients.add(order.clientName);
        order.floors.forEach(floor => {
            floor.rooms.forEach(room => {
                room.items.forEach(item => {
                    totalServices += item.quantity;
                });
            });
        });
    });
    
    // Update DOM
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('totalServices').textContent = totalServices;
    document.getElementById('uniqueClients').textContent = uniqueClients.size;
}

function updateCharts() {
    const orders = getOrdersFromCentralStorage();
    
    // Process data for charts
    const serviceCounts = {};
    const dateCounts = {};
    
    orders.forEach(order => {
        // Count services
        order.floors.forEach(floor => {
            floor.rooms.forEach(room => {
                room.items.forEach(item => {
                    if (serviceCounts[item.service]) {
                        serviceCounts[item.service] += item.quantity;
                    } else {
                        serviceCounts[item.service] = item.quantity;
                    }
                });
            });
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
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.7)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Orders Trend',
                    color: '#fff'
                },
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#ddd'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#ddd'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
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
                    'rgba(100, 100, 100, 0.8)',
                    'rgba(150, 150, 150, 0.8)',
                    'rgba(200, 200, 200, 0.8)',
                    'rgba(100, 100, 100, 0.6)',
                    'rgba(150, 150, 150, 0.6)',
                    'rgba(200, 200, 200, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff'
                    }
                },
                title: {
                    display: true,
                    text: 'Service Distribution',
                    color: '#fff'
                }
            }
        }
    });
}

function populateOrdersTable() {
    const orders = getOrdersFromCentralStorage();
    const activeTbody = document.querySelector('#ordersTable tbody');
    const completedTbody = document.querySelector('#completedOrdersTable tbody');
    activeTbody.innerHTML = '';
    completedTbody.innerHTML = '';
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display orders in appropriate tables
    orders.forEach(order => {
        const row = document.createElement('tr');
        if (order.status === 'completed') {
            row.classList.add('completed');
        }
        
        // Calculate totals
        const totalFloors = order.floors.length;
        const totalRooms = order.floors.reduce((sum, floor) => sum + floor.rooms.length, 0);
        
        // Format services list
        const servicesList = [];
        order.floors.forEach(floor => {
            floor.rooms.forEach(room => {
                room.items.forEach(item => {
                    servicesList.push(`${item.service} (${item.quantity})`);
                });
            });
        });
        
        row.innerHTML = `
            <td>${order.date}</td>
            <td>${order.clientName}</td>
            <td>${totalFloors}</td>
            <td>${totalRooms}</td>
            <td>${servicesList.join(', ')}</td>
            ${order.status === 'completed' ? `<td>${order.completedDate}</td>` : ''}
            <td>
                <button class="btn btn-sm btn-info view-order btn-glossy" data-id="${order.id}">View</button>
                ${order.status === 'active' ? 
                    `<button class="btn btn-sm btn-success complete-order btn-glossy" data-id="${order.id}">Complete</button>` : 
                    `<button class="btn btn-sm btn-warning export-jpg btn-glossy" data-id="${order.id}">Export JPG</button>`
                }
                <button class="btn btn-sm btn-danger delete-order btn-glossy" data-id="${order.id}">Delete</button>
            </td>
        `;
        
        if (order.status === 'completed') {
            completedTbody.appendChild(row);
        } else {
            activeTbody.appendChild(row);
        }
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            viewOrder(orderId);
        });
    });
    
    document.querySelectorAll('.complete-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            completeOrder(orderId);
        });
    });
    
    document.querySelectorAll('.export-jpg').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            exportTableAsJPG(orderId);
        });
    });
    
    document.querySelectorAll('.delete-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            deleteOrder(orderId);
        });
    });
}

function viewOrder(orderId) {
    const orders = getOrdersFromCentralStorage();
    const order = orders.find(o => o.id == orderId);
    
    if (order) {
        let orderDetails = `Order Details:\nClient: ${order.clientName}\nDate: ${order.date}\nSubmitted by: ${order.submittedBy}\n\n`;
        
        order.floors.forEach(floor => {
            orderDetails += `Floor: ${floor.name}\n`;
            floor.rooms.forEach(room => {
                orderDetails += `  Room: ${room.name}\n`;
                room.items.forEach(item => {
                    orderDetails += `    - ${item.service} (Qty: ${item.quantity})\n`;
                });
            });
        });
        
        if (order.status === 'completed') {
            orderDetails += `\nCompleted on: ${order.completedDate}`;
            if (order.completedBy) {
                orderDetails += `\nCompleted by: ${order.completedBy}`;
            }
        }
        
        alert(orderDetails);
    }
}

function completeOrder(orderId) {
    if (confirm('Are you sure you want to mark this order as completed?')) {
        const data = getCentralData();
        const order = data.orders.find(o => o.id == orderId);
        
        if (order) {
            order.status = 'completed';
            order.completedDate = new Date().toISOString().split('T')[0];
            order.completedBy = JSON.parse(localStorage.getItem('currentUser')).username;
            
            saveToCentralData(data);
            updateDashboard();
            alert('Order marked as completed!');
        }
    }
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        const data = getCentralData();
        data.orders = data.orders.filter(order => order.id != orderId);
        saveToCentralData(data);
        updateDashboard();
        alert('Order deleted successfully!');
    }
}

function exportDataToCSV() {
    const orders = getOrdersFromCentralStorage();
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header row
    csvContent += "Date,Client,Floor,Room,Service,Quantity,Status,Submitted By\n";
    
    // Add data rows
    orders.forEach(order => {
        order.floors.forEach(floor => {
            floor.rooms.forEach(room => {
                room.items.forEach(item => {
                    csvContent += `${order.date},${order.clientName},${floor.name},${room.name},${item.service},${item.quantity},${order.status},${order.submittedBy}\n`;
                });
            });
        });
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kazkleen_orders_export.csv");
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
}