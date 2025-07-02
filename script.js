// Authentication and User Management
let currentUser = null;
let users = []; // Will store registered users

// ============================
// AUTHENTICATION FUNCTIONS
// ============================

// Simple password hashing (for demo purposes)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

// Check authentication status
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (savedUser && rememberMe === 'true') {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showAuthModal();
    }
}

// Show authentication modal
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('mainApp').classList.add('hidden');
}

// Show main application
function showMainApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    
    if (currentUser) {
        updateUserInterface();
    }
}

// Update user interface with current user info
function updateUserInterface() {
    if (currentUser) {
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        document.getElementById('userAvatar').textContent = initials;
        document.getElementById('userName').textContent = currentUser.name;
    }
}

// Handle registration
function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showToast('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showToast('Please agree to the Terms & Conditions', 'error');
        return;
    }
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
        showToast('An account with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: hashPassword(password),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    
    showToast('Account created successfully! Please login.', 'success');
    showLogin();
    
    // Clear form
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPhone').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('agreeTerms').checked = false;
}

// Handle login
function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    // Find user
    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    
    if (user) {
        currentUser = user;
        
        // Save session
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        showToast(`Welcome back, ${user.name}!`, 'success');
        showMainApp();
        
        // Clear form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('rememberMe').checked = false;
    } else {
        showToast('Invalid email or password', 'error');
    }
}

// Handle password reset
function resetPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }
    
    const user = users.find(u => u.email === email);
    
    if (user) {
        showToast('Password reset link sent to your email (simulation)', 'success');
        showLogin();
        document.getElementById('resetEmail').value = '';
    } else {
        showToast('No account found with this email address', 'error');
    }
}

// Handle logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    showToast('Logged out successfully', 'success');
    showAuthModal();
    hideUserDropdown();
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar || !strengthText) return;
    
    switch (strength) {
        case 0:
        case 1:
            strengthBar.className = 'strength-bar weak';
            feedback = 'Weak password';
            break;
        case 2:
            strengthBar.className = 'strength-bar fair';
            feedback = 'Fair password';
            break;
        case 3:
        case 4:
            strengthBar.className = 'strength-bar good';
            feedback = 'Good password';
            break;
        case 5:
            strengthBar.className = 'strength-bar strong';
            feedback = 'Strong password';
            break;
    }
    
    strengthText.textContent = feedback;
}

// Form switching functions
function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('authTitle').textContent = 'Login to ChamaBot Pro';
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('authTitle').textContent = 'Create Your Account';
}

function showForgotPassword() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.remove('hidden');
    document.getElementById('authTitle').textContent = 'Reset Password';
}

// User management functions
function loadUsers() {
    const savedUsers = localStorage.getItem('registeredUsers');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

function saveUsers() {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
}

function hideUserDropdown() {
    document.getElementById('userDropdown').classList.add('hidden');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    checkAuth();
    loadData(); // Load existing ChamaBot data
    
    // Add password strength checking
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('userDropdown');
        
        if (userMenu && !userMenu.contains(event.target)) {
            dropdown.classList.add('hidden');
        }
    });
});
