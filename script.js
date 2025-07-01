
// Sample data
let members = [
    { id: 1, name: "Grace Wanjiku", phone: "+254712345678", totalContributed: 12000, status: "active" },
    { id: 2, name: "John Kamau", phone: "+254723456789", totalContributed: 8000, status: "pending" },
    { id: 3, name: "Mary Akinyi", phone: "+254734567890", totalContributed: 15000, status: "active" },
    { id: 4, name: "Peter Mwangi", phone: "+254745678901", totalContributed: 10000, status: "overdue" }
];

// Load data from localStorage or use default
function loadData() {
    const savedMembers = localStorage.getItem('chamaMembers');
    if (savedMembers) {
        members = JSON.parse(savedMembers);
    }
    updateStats();
    renderMembers();
    renderProgress();
    updatePaymentOptions();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('chamaMembers', JSON.stringify(members));
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    toast.className = `toast ${type} show`;
    messageEl.textContent = message;
    
    // Set appropriate icon
    switch(type) {
        case 'success':
            icon.className = 'toast-icon fas fa-check-circle';
            break;
        case 'info':
            icon.className = 'toast-icon fas fa-info-circle';
            break;
        case 'error':
            icon.className = 'toast-icon fas fa-exclamation-circle';
            break;
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Update statistics
function updateStats() {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const pendingMembers = members.filter(m => m.status === 'pending').length;
    const overdueMembers = members.filter(m => m.status === 'overdue').length;
    const totalContributions = members.reduce((sum, m) => sum + m.totalContributed, 0);
    
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('activeMembers').textContent = `${activeMembers} active members`;
    document.getElementById('pendingMembers').textContent = pendingMembers;
    document.getElementById('overdueMembers').textContent = overdueMembers;
    document.getElementById('totalContributions').textContent = `KES ${totalContributions.toLocaleString()}`;
    
    // Update reminder counts
    document.getElementById('pendingCount').textContent = pendingMembers;
    document.getElementById('overdueCount').textContent = overdueMembers;
    document.getElementById('allCount').textContent = totalMembers;
}

// Render members list
function renderMembers() {
    const membersList = document.getElementById('membersList');
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    
    const filteredMembers = members.filter(member => 
        member.name.toLowerCase().includes(searchTerm) || 
        member.phone.includes(searchTerm)
    );
    
    if (filteredMembers.length === 0) {
        membersList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6b7280;">
                <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; color: #d1d5db;"></i>
                <p>No members found matching your search.</p>
            </div>
        `;
        return;
    }
    
    membersList.innerHTML = filteredMembers.map(member => `
        <div class="member-card">
            <div class="member-content">
                <div class="member-info">
                    <div class="member-avatar">
                        ${member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="member-details">
                        <h3>${member.name}</h3>
                        <p>${member.phone}</p>
                        <p class="member-contribution">KES ${member.totalContributed.toLocaleString()} contributed</p>
                    </div>
                </div>
                <div class="member-actions">
                    <span class="status-badge status-${member.status}">${member.status}</span>
                    <button class="action-btn" onclick="callMember('${member.name}', '${member.phone}')" title="Call">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="action-btn whatsapp" onclick="sendWhatsApp('${member.name}')" title="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="action-btn" onclick="editMember(${member.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render progress list
function renderProgress() {
    const progressList = document.getElementById('progressList');
    const monthlyTarget = 2000;
    
    progressList.innerHTML = members.map(member => {
        const progress = Math.min((member.totalContributed / monthlyTarget) * 100, 100);
        const statusIcon = member.totalContributed >= monthlyTarget ? 'check-circle' : 
                          member.totalContributed > 0 ? 'clock' : 'exclamation-triangle';
        const statusText = member.totalContributed >= monthlyTarget ? 'Complete' : 
                          member.totalContributed > 0 ? 'Partial' : 'Pending';
        const statusColor = member.totalContributed >= monthlyTarget ? 'status-active' : 
                           member.totalContributed > 0 ? 'status-pending' : 'status-overdue';
        
        return `
            <div class="progress-item">
                <div class="progress-info">
                    <div class="progress-avatar">
                        ${member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div class="progress-details">
                        <h3>${member.name}</h3>
                        <p>KES ${member.totalContributed.toLocaleString()} / KES ${monthlyTarget.toLocaleString()}</p>
                    </div>
                </div>
                <div class="progress-actions">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="status-badge ${statusColor}">
                        <i class="fas fa-${statusIcon}"></i> ${statusText}
                    </span>
                    <span class="progress-percentage">${Math.round(progress)}%</span>
                </div>
            </div>
        `;
    }).join('');
}

// Update payment options
function updatePaymentOptions() {
    const paymentMember = document.getElementById('paymentMember');
    paymentMember.innerHTML = '<option value="">Select member</option>' +
        members.map(member => `<option value="${member.id}">${member.name}</option>`).join('');
}

// Add member form functions
function showAddMemberForm() {
    document.getElementById('addMemberForm').classList.remove('hidden');
}

function hideAddMemberForm() {
    document.getElementById('addMemberForm').classList.add('hidden');
    document.getElementById('newMemberName').value = '';
    document.getElementById('newMemberPhone').value = '';
}

function addMember() {
    const name = document.getElementById('newMemberName').value.trim();
    const phone = document.getElementById('newMemberPhone').value.trim();
    
    if (!name || !phone) {
        showToast('Please fill in both name and phone number', 'error');
        return;
    }
    
    const newMember = {
        id: Date.now(),
        name: name,
        phone: phone,
        totalContributed: 0,
        status: 'pending'
    };
    
    members.push(newMember);
    saveData();
    updateStats();
    renderMembers();
    renderProgress();
    updatePaymentOptions();
    hideAddMemberForm();
    
    showToast(`${name} added to the chama!`);
}

// Filter members
function filterMembers() {
    renderMembers();
}

// Record payment
function recordPayment() {
    const memberId = document.getElementById('paymentMember').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;
    
    if (!memberId || !amount || !method) {
        showToast('Please fill in all payment details', 'error');
        return;
    }
    
    const member = members.find(m => m.id == memberId);
    if (member) {
        member.totalContributed += amount;
        
        // Update status based on contribution
        if (member.totalContributed >= 2000) {
            member.status = 'active';
        } else if (member.totalContributed > 0) {
            member.status = 'pending';
        }
        
        saveData();
        updateStats();
        renderMembers();
        renderProgress();
        
        // Clear form
        document.getElementById('paymentMember').value = '';
        document.getElementById('paymentAmount').value = '';
        document.getElementById('paymentMethod').value = '';
        
        showToast(`Payment of KES ${amount.toLocaleString()} recorded for ${member.name} via ${method}`);
    }
}

// Member actions
function callMember(name, phone) {
    showToast(`Calling ${name} at ${phone}`, 'info');
}

function sendWhatsApp(name) {
    showToast(`WhatsApp reminder sent to ${name}`);
}

function editMember(id) {
    showToast('Edit functionality coming soon', 'info');
}

// Reminder functions
function sendReminders(type) {
    let message = '';
    if (type === 'pending') {
        const pendingCount = members.filter(m => m.status === 'pending').length;
        message = `Reminders sent to ${pendingCount} pending members`;
    } else if (type === 'overdue') {
        const overdueCount = members.filter(m => m.status === 'overdue').length;
        message = `Urgent reminders sent to ${overdueCount} overdue members`;
    } else {
        message = `Reminders sent to all ${members.length} members`;
    }
    showToast(message);
}

// Header actions
function sendWhatsAppReminders() {
    showToast('Reminders sent to all pending members via WhatsApp!');
}

function sendSMS() {
    showToast('SMS reminders sent to overdue members!');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// Auto-save data when page unloads
window.addEventListener('beforeunload', function() {
    saveData();
});
