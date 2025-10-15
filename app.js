// Application State
const state = {
    currentUser: null,
    users: JSON.parse(localStorage.getItem('aceFreelancingUsers')) || [],
    tasks: JSON.parse(localStorage.getItem('aceFreelancingTasks')) || [],
    transactions: JSON.parse(localStorage.getItem('aceFreelancingTransactions')) || [],
    awardedTasks: JSON.parse(localStorage.getItem('aceFreelancingAwardedTasks')) || [],
    paymentType: null // 'activation' or 'training'
};

// DOM Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const emailVerificationModal = document.getElementById('emailVerificationModal');
const stkPushModal = document.getElementById('stkPushModal');
const paymentLoading = document.getElementById('paymentLoading');
const paymentSuccess = document.getElementById('paymentSuccess');
const paymentError = document.getElementById('paymentError');
const paymentForm = document.getElementById('paymentForm');
const errorMessage = document.getElementById('errorMessage');
const mainContent = document.getElementById('mainContent');
const dashboard = document.getElementById('dashboard');
const userProfile = document.getElementById('userProfile');
const navButtons = document.querySelector('.nav-buttons');

// Initialize the application
function init() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('aceFreelancingCurrentUser');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }

    // Load sample data if none exists
    if (state.tasks.length === 0) {
        loadSampleData();
    }

    updateDashboardStats();
    setupEventListeners();
}

// Load sample data for demonstration
function loadSampleData() {
    const sampleTasks = [
        {
            id: 1,
            title: "High School Biology Essay",
            description: "Write a 1000-word essay on photosynthesis process",
            price: 800,
            category: "Biology",
            complexity: "Medium",
            deadline: "2025-03-15",
            words: 1000
        },
        {
            id: 2,
            title: "University Economics Paper",
            description: "Research paper on impact of inflation in Kenya (2500 words)",
            price: 2500,
            category: "Economics",
            complexity: "High",
            deadline: "2025-03-20",
            words: 2500
        },
        {
            id: 3,
            title: "Primary School Composition",
            description: "Creative writing: 'My Favorite Teacher' (500 words)",
            price: 400,
            category: "English",
            complexity: "Low",
            deadline: "2025-03-10",
            words: 500
        }
    ];

    state.tasks = sampleTasks;
    saveData();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('aceFreelancingUsers', JSON.stringify(state.users));
    localStorage.setItem('aceFreelancingTasks', JSON.stringify(state.tasks));
    localStorage.setItem('aceFreelancingTransactions', JSON.stringify(state.transactions));
    localStorage.setItem('aceFreelancingAwardedTasks', JSON.stringify(state.awardedTasks));
    if (state.currentUser) {
        localStorage.setItem('aceFreelancingCurrentUser', JSON.stringify(state.currentUser));
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    if (state.currentUser) {
        // Update user profile
        const nameParts = state.currentUser.name.split(' ');
        const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
        document.getElementById('userAvatar').textContent = initials;
        document.getElementById('userName').textContent = state.currentUser.name;
        
        // Show user profile, hide login buttons
        userProfile.style.display = 'flex';
        navButtons.style.display = 'none';
        
        // Show dashboard by default
        showDashboard();
        
        // Update account status
        updateAccountStatus();
    } else {
        // Show login buttons, hide user profile
        userProfile.style.display = 'none';
        navButtons.style.display = 'flex';
        
        // Show main content
        showMainContent();
    }
}

// Show main content
function showMainContent() {
    mainContent.style.display = 'block';
    dashboard.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    mainContent.style.display = 'none';
    dashboard.style.display = 'block';
    updateDashboardStats();
    updateAccountInfo();
    renderAwardedTasks();
}

// Update dashboard statistics
function updateDashboardStats() {
    if (!state.currentUser) return;

    const userTransactions = state.transactions.filter(t => t.userId === state.currentUser.id);
    const totalEarnings = userTransactions
        .filter(t => t.type === 'earning')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
        
    const totalMoneyIn = userTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
        
    const totalExpenses = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);
        
    const accountBalance = totalMoneyIn + totalEarnings - totalExpenses;

    document.getElementById('totalEarnings').textContent = `KES ${totalEarnings}`;
    document.getElementById('totalMoneyIn').textContent = `KES ${totalMoneyIn}`;
    document.getElementById('totalExpenses').textContent = `KES ${totalExpenses}`;
    document.getElementById('accountBalance').textContent = `KES ${accountBalance}`;
    document.getElementById('withdrawBalance').textContent = `KES ${accountBalance}`;
    document.getElementById('displayBalance').textContent = `KES ${accountBalance}`;
}

// Update account information
function updateAccountInfo() {
    if (!state.currentUser) return;

    document.getElementById('displayUsername').textContent = state.currentUser.username || state.currentUser.name.split(' ').join('_').toLowerCase();
    document.getElementById('displayEmail').textContent = state.currentUser.email;
    document.getElementById('displayPhone').textContent = state.currentUser.phone;
}

// Update account status
function updateAccountStatus() {
    if (!state.currentUser) return;

    const statusText = state.currentUser.active ? 'Active' : 'Inactive';
    const statusElement = document.getElementById('statusText');
    const displayStatus = document.getElementById('displayStatus');
    
    statusElement.textContent = statusText;
    displayStatus.textContent = statusText;
    
    if (state.currentUser.active) {
        statusElement.style.color = 'var(--success)';
        displayStatus.style.color = 'var(--success)';
        document.getElementById('activateAccountBtn').style.display = 'none';
    } else {
        statusElement.style.color = 'var(--danger)';
        displayStatus.style.color = 'var(--danger)';
        document.getElementById('activateAccountBtn').style.display = 'inline-block';
    }
}

// Render awarded tasks
function renderAwardedTasks() {
    const container = document.getElementById('awardedTasksContainer');
    const userAwardedTasks = state.awardedTasks.filter(task => task.userId === state.currentUser.id);
    
    if (userAwardedTasks.length === 0) {
        container.innerHTML = '<p>No awarded tasks yet. Select a task from the Available Tasks section.</p>';
        return;
    }
    
    container.innerHTML = userAwardedTasks.map(task => `
        <div class="task-card">
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <div class="task-price">KES ${task.price}</div>
            <div class="task-due">Due: ${formatDate(task.deadline)}</div>
            <div class="task-actions">
                <button class="btn btn-primary start-task" data-task="${task.id}">Start Writing</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to start task buttons
    document.querySelectorAll('.start-task').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.target.getAttribute('data-task');
            showSubmissionForm(taskId);
        });
    });
}

// Show submission form
function showSubmissionForm(taskId) {
    const task = state.awardedTasks.find(t => t.id == taskId);
    const container = document.getElementById('submissionContainer');
    
    container.innerHTML = `
        <div class="task-card">
            <h4>${task.title}</h4>
            <p>Submit your completed work for: "${task.description}"</p>
            <form id="submissionForm">
                <div class="form-group">
                    <label for="fileUpload">Upload File (PDF, TXT, or JPEG)</label>
                    <input type="file" id="fileUpload" class="form-control" accept=".pdf,.txt,.jpg,.jpeg" required>
                </div>
                <div class="form-group">
                    <label for="submissionNotes">Additional Notes (Optional)</label>
                    <textarea id="submissionNotes" class="form-control" placeholder="Any additional information about your submission..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Work</button>
            </form>
        </div>
    `;
    
    // Switch to submission section
    document.querySelectorAll('.dashboard-nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector('[data-section="submission"]').classList.add('active');
    document.querySelectorAll('.dashboard-section').forEach(section => section.classList.remove('active'));
    document.getElementById('submission-section').classList.add('active');
    
    // Handle submission
    document.getElementById('submissionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('fileUpload');
        const notes = document.getElementById('submissionNotes').value;
        
        if (fileInput.files.length > 0) {
            // In a real app, you would upload the file to a server
            // For demo, we'll simulate successful submission
            simulateTaskCompletion(taskId, task.price);
            showNotification('Work submitted successfully! It will be reviewed within 24 hours.', 'success');
            fileInput.value = '';
            document.getElementById('submissionNotes').value = '';
        }
    });
}

// Simulate task completion and payment
function simulateTaskCompletion(taskId, amount) {
    // Remove from awarded tasks
    state.awardedTasks = state.awardedTasks.filter(task => task.id != taskId);
    
    // Add earning transaction
    const transaction = {
        id: generateId(),
        userId: state.currentUser.id,
        type: 'earning',
        amount: amount,
        description: 'Task completion payment',
        method: 'system',
        createdAt: new Date().toISOString()
    };
    
    state.transactions.push(transaction);
    saveData();
    
    // Update UI
    updateDashboardStats();
    renderAwardedTasks();
}

// Simulate M-Pesa STK Push
async function simulateSTKPush(phoneNumber, amount, description) {
    return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
            // For demo purposes, simulate 80% success rate
            const success = Math.random() > 0.2;
            resolve({
                success: success,
                message: success ? 'Payment initiated successfully' : 'Payment failed. Please try again.',
                transactionId: success ? 'MPESA_' + Date.now() : null
            });
        }, 3000);
    });
}

// Process successful payment
function processSuccessfulPayment(amount, description, phoneNumber, transactionId) {
    // Record the transaction
    const transaction = {
        id: generateId(),
        userId: state.currentUser.id,
        type: 'expense',
        amount: amount,
        description: description,
        method: 'mpesa',
        phone: phoneNumber,
        transactionId: transactionId,
        createdAt: new Date().toISOString()
    };
    
    state.transactions.push(transaction);
    
    // Update user status if it's an activation
    if (state.paymentType === 'activation') {
        state.currentUser.active = true;
        state.users = state.users.map(u => u.id === state.currentUser.id ? {...u, active: true} : u);
    }
    
    saveData();
    
    // Update UI
    updateDashboardStats();
    updateAccountStatus();
    
    showNotification('Payment successful! Your request has been processed.', 'success');
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        z-index: 3000;
        max-width: 300px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Setup event listeners
function setupEventListeners() {
    // Open login modal
    document.getElementById('loginBtn').addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'flex';
    });

    // Open register modal
    document.getElementById('registerBtn').addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'flex';
    });

    // Open forgot password modal
    document.getElementById('forgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        forgotPasswordModal.style.display = 'flex';
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            forgotPasswordModal.style.display = 'none';
            emailVerificationModal.style.display = 'none';
            stkPushModal.style.display = 'none';
        });
    });

    // Switch between login and register modals
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'flex';
    });

    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });

    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Find user
        const user = state.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            state.currentUser = user;
            saveData();
            updateUIForLoggedInUser();
            loginModal.style.display = 'none';
            
            // Show success message
            showNotification('Login successful! Welcome back to Ace Freelancing.', 'success');
        } else {
            showNotification('Invalid email or password. Please try again.', 'error');
        }
    });

    // Registration form submission
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showNotification('Passwords do not match. Please try again.', 'error');
            return;
        }
        
        // Check if user already exists
        if (state.users.find(u => u.email === email)) {
            showNotification('An account with this email already exists.', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateId(),
            name,
            email,
            phone,
            password,
            active: false,
            createdAt: new Date().toISOString()
        };
        
        state.users.push(newUser);
        state.currentUser = newUser;
        saveData();
        
        // Show email verification
        registerModal.style.display = 'none';
        emailVerificationModal.style.display = 'flex';
        
        // Show success message
        showNotification('Registration successful! Please verify your email.', 'success');
    });

    // Email verification form submission
    document.getElementById('emailVerificationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, this would verify the code sent to the user's email
        // For demo purposes, we'll just accept any code
        emailVerificationModal.style.display = 'none';
        updateUIForLoggedInUser();
        showNotification('Email verified successfully! Your account has been created.', 'success');
    });

    // Forgot password form submission
    document.getElementById('forgotPasswordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;
        
        // In a real app, this would send a reset link to the user's email
        // For demo purposes, we'll just show a success message
        forgotPasswordModal.style.display = 'none';
        showNotification('Password reset link has been sent to your email.', 'success');
    });

    // STK Push form submission
    document.getElementById('stkPushForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        // Validate phone number
        if (!phoneNumber.startsWith('07') || phoneNumber.length !== 10) {
            showNotification('Please enter a valid Safaricom number (07XXXXXXXX).', 'error');
            return;
        }
        
        // Show loading state
        paymentForm.style.display = 'none';
        paymentLoading.style.display = 'block';
        paymentSuccess.style.display = 'none';
        paymentError.style.display = 'none';
        
        try {
  
