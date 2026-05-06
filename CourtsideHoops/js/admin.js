let products = [
  { id: 1, name: "Stephen Curry", category: "Epic", price: 800, stock: 24 },
  { id: 2, name: "LeBron James", category: "Legendary", price: 1200, stock: 12 },
  { id: 3, name: "Kyrie Irving", category: "Epic", price: 950, stock: 5 },
  { id: 4, name: "Luka Doncic", category: "Rare", price: 500, stock: 8 }
];

let deliveries = [
  { id: "ORD-1001", customer: "LeBron James", product: "Lakers 2020 LeBron", date: "2025-04-28", status: "Processing" },
  { id: "ORD-1002", customer: "Stephen Curry", product: "Unanimous MVP Curry", date: "2025-04-27", status: "Shipped" },
  { id: "ORD-1003", customer: "Kevin Durant", product: "Dynasty KD", date: "2025-04-26", status: "Delivered" },
  { id: "ORD-1004", customer: "Giannis Antetokounmpo", product: "New Era Giannis", date: "2025-04-29", status: "Pending" }
];

let users = [
  { id: 1, name: "Alex Morgan", email: "alex@courtside.com", role: "customer", banned: false },
  { id: 2, name: "Jordan Taylor", email: "jordan@hoops.net", role: "customer", banned: false },
  { id: 3, name: "Casey Williams", email: "casey@gmail.com", role: "customer", banned: false },
  { id: 4, name: "Riley Johnson", email: "riley@courtside.com", role: "customer", banned: true },
  { id: 5, name: "Sam Lee", email: "sam.lee@support.com", role: "customer", banned: false }
];

let announcements = [
  { id: 1, title: "Site Maintenance", content: "We will be performing scheduled maintenance on May 1st from 2AM to 4AM EST.", date: "2025-04-25", status: "Published" },
  { id: 2, title: "New Collection Drop", content: "Introducing the new Summer 2025 collection featuring exclusive player editions!", date: "2025-04-20", status: "Published" },
  { id: 3, title: "Holiday Shipping Schedule", content: "Shipping delays expected during Memorial Day weekend.", date: "2025-04-22", status: "Draft" }
];

// ========== EDITING STATE ==========
let editingProductId = null;
let editingDeliveryId = null;
let editingUserId = null;
let editingAnnouncementId = null;

// ========== HELPER ==========
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ========== PRODUCT FUNCTIONS ==========
function renderProducts() {
  const tbody = document.getElementById('productTableBody');
  if (!tbody) return;
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No products. Click "Add Product"</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(prod => `
    <tr>
      <td><strong>${escapeHtml(prod.name)}</strong></td>
      <td>${escapeHtml(prod.category)}</td>
      <td>₱${prod.price.toFixed(2)}</td>
      <td><span class="badge-stock">${prod.stock} units</span></td>
      <td class="action-icons">
        <i class="fas fa-edit" onclick="editProduct(${prod.id})" style="cursor:pointer;"></i>
        <i class="fas fa-trash-alt" onclick="deleteProduct(${prod.id})" style="cursor:pointer;"></i>
      </td>
    </tr>
  `).join('');
}

function openProductModal(title, product = null) {
  const modal = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  modalTitle.textContent = title;
  
  if (product) {
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    editingProductId = product.id;
  } else {
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    editingProductId = null;
  }
  modal.style.display = 'flex';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  editingProductId = null;
}

function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const stock = parseInt(document.getElementById('productStock').value);

  if (!name) { alert('Enter product name'); return; }
  if (isNaN(price)) { alert('Valid price required'); return; }
  if (isNaN(stock)) { alert('Valid stock required'); return; }

  if (editingProductId !== null) {
    const index = products.findIndex(p => p.id === editingProductId);
    if (index !== -1) {
      products[index] = { ...products[index], name, category: category || 'Uncategorized', price, stock };
    }
  } else {
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name, category: category || 'Uncategorized', price, stock });
  }
  renderProducts();
  closeProductModal();
}

function editProduct(id) {
  const p = products.find(p => p.id === id);
  if (p) openProductModal('Edit Product', p);
}

function deleteProduct(id) {
  if (confirm('Delete this product?')) {
    products = products.filter(p => p.id !== id);
    renderProducts();
  }
}

// ========== DELIVERY FUNCTIONS ==========
function renderDeliveries() {
  const tbody = document.getElementById('deliveryTableBody');
  if (!tbody) return;
  if (deliveries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No orders found</td></tr>';
    return;
  }
  tbody.innerHTML = deliveries.map(del => `
    <tr>
      <td>${escapeHtml(del.id)}</td>
      <td>${escapeHtml(del.customer)}</td>
      <td>${escapeHtml(del.product)}</td>
      <td>${del.date}</td>
      <td><span class="status-badge status-${del.status.toLowerCase()}">${del.status}</span></td>
      <td class="action-icons">
        <i class="fas fa-edit" onclick="editDelivery('${del.id}')" style="cursor:pointer;"></i>
        <i class="fas fa-trash-alt" onclick="deleteDelivery('${del.id}')" style="cursor:pointer;"></i>
      </td>
    </tr>
  `).join('');

  const processing = deliveries.filter(d => d.status === 'Processing').length;
  const shipped = deliveries.filter(d => d.status === 'Shipped').length;
  const delivered = deliveries.filter(d => d.status === 'Delivered').length;
  const pending = deliveries.filter(d => d.status === 'Pending').length;
  const statsContainer = document.getElementById('deliveryStats');
  if (statsContainer) {
    statsContainer.innerHTML = `<div class="stat-card"><h4>Processing</h4><p>${processing}</p></div>
                                <div class="stat-card"><h4>Shipped</h4><p>${shipped}</p></div>
                                <div class="stat-card"><h4>Delivered</h4><p>${delivered}</p></div>
                                <div class="stat-card"><h4>Pending</h4><p>${pending}</p></div>`;
  }
}

function openDeliveryModal(delivery = null) {
  const modal = document.getElementById('deliveryModal');
  if (delivery) {
    document.getElementById('deliveryCustomer').value = delivery.customer;
    document.getElementById('deliveryProduct').value = delivery.product;
    document.getElementById('deliveryDate').value = delivery.date;
    document.getElementById('deliveryStatusSelect').value = delivery.status;
    editingDeliveryId = delivery.id;
    document.getElementById('deliveryModalTitle').textContent = 'Edit Order';
  } else {
    document.getElementById('deliveryCustomer').value = '';
    document.getElementById('deliveryProduct').value = '';
    document.getElementById('deliveryDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('deliveryStatusSelect').value = 'Processing';
    editingDeliveryId = null;
    document.getElementById('deliveryModalTitle').textContent = 'Add Order';
  }
  modal.style.display = 'flex';
}

function closeDeliveryModal() {
  document.getElementById('deliveryModal').style.display = 'none';
  editingDeliveryId = null;
}

function saveDelivery() {
  const customer = document.getElementById('deliveryCustomer').value.trim();
  const product = document.getElementById('deliveryProduct').value.trim();
  const date = document.getElementById('deliveryDate').value;
  const status = document.getElementById('deliveryStatusSelect').value;

  if (!customer || !product) {
    alert('Customer name and product are required');
    return;
  }
  if (!date) {
    alert('Please select a date');
    return;
  }

  if (editingDeliveryId !== null) {
    const index = deliveries.findIndex(d => d.id === editingDeliveryId);
    if (index !== -1) {
      deliveries[index] = { ...deliveries[index], customer, product, date, status };
    }
  } else {
    const newId = "ORD-" + (Math.floor(Math.random() * 9000) + 1000);
    deliveries.push({ id: newId, customer, product, date, status });
  }
  renderDeliveries();
  closeDeliveryModal();
}

function editDelivery(id) {
  const delivery = deliveries.find(d => d.id === id);
  if (delivery) openDeliveryModal(delivery);
}

function deleteDelivery(id) {
  if (confirm('Remove this order?')) {
    deliveries = deliveries.filter(d => d.id !== id);
    renderDeliveries();
  }
}

// ========== USER FUNCTIONS ==========
function renderUsers() {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users found</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(user => `
    <tr class="${user.banned ? 'user-row-banned' : ''}">
      <td>${user.id}</td>
      <td>${escapeHtml(user.name)}${user.banned ? ' 🚫' : ''}</td>
      <td>${escapeHtml(user.email)}</td>
      <td><span class="role-badge role-${user.role}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
      <td>${user.banned ? '<span style="color:#ef4444;">Banned</span>' : '<span style="color:#22c55e;">Active</span>'}</td>
      <td class="action-icons">
        ${!user.banned ? `<i class="fas fa-gavel" onclick="banUser(${user.id})" title="Ban User" style="color:#ef4444; cursor:pointer;"></i>` : `<i class="fas fa-check-circle" onclick="unbanUser(${user.id})" title="Unban User" style="color:#22c55e; cursor:pointer;"></i>`}
        <i class="fas fa-edit" onclick="editUser(${user.id})" style="cursor:pointer;"></i>
        <i class="fas fa-trash-alt" onclick="deleteUser(${user.id})" style="cursor:pointer;"></i>
      </td>
    </tr>
  `).join('');

  const total = users.length;
  const active = users.filter(u => !u.banned).length;
  const banned = users.filter(u => u.banned).length;
  const statsContainer = document.getElementById('userStats');
  if (statsContainer) {
    statsContainer.innerHTML = `<div class="stat-card"><h4>Total Users</h4><p>${total}</p></div>
                                <div class="stat-card"><h4>Active</h4><p>${active}</p></div>
                                <div class="stat-card"><h4>Banned</h4><p>${banned}</p></div>
                                <div class="stat-card"><h4>Customers</h4><p>${users.filter(u => u.role === 'customer' && !u.banned).length}</p></div>`;
  }
}

function openUserModal(user = null) {
  const modal = document.getElementById('userModal');
  if (user) {
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRoleSelect').value = user.role;
    editingUserId = user.id;
    document.getElementById('userModalTitle').textContent = 'Edit User';
  } else {
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userRoleSelect').value = 'customer';
    editingUserId = null;
    document.getElementById('userModalTitle').textContent = 'Add User';
  }
  modal.style.display = 'flex';
}

function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
  editingUserId = null;
}

function saveUser() {
  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const role = document.getElementById('userRoleSelect').value;

  if (!name || !email) {
    alert('Name and email are required');
    return;
  }
  if (!email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }

  if (editingUserId !== null) {
    const index = users.findIndex(u => u.id === editingUserId);
    if (index !== -1) {
      users[index] = { ...users[index], name, email, role };
    }
  } else {
    const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 6;
    users.push({ id: newId, name, email, role, banned: false });
  }
  renderUsers();
  closeUserModal();
}

function editUser(id) {
  const user = users.find(u => u.id === id);
  if (user) openUserModal(user);
}

function deleteUser(id) {
  if (confirm('Delete this user permanently?')) {
    users = users.filter(u => u.id !== id);
    renderUsers();
  }
}

function banUser(id) {
  const user = users.find(u => u.id === id);
  if (user && !user.banned) {
    user.banned = true;
    renderUsers();
  }
}

function unbanUser(id) {
  const user = users.find(u => u.id === id);
  if (user && user.banned) {
    user.banned = false;
    renderUsers();
  }
}

// ========== ANNOUNCEMENT FUNCTIONS ==========
function renderAnnouncements() {
  const tbody = document.getElementById('announcementTableBody');
  if (!tbody) return;
  if (announcements.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No announcements. Click "Create Announcement"</td></tr>';
    return;
  }
  tbody.innerHTML = announcements.map(ann => `
    <tr>
      <td>${ann.id}</td>
      <td><strong>${escapeHtml(ann.title)}</strong></td>
      <td class="announcement-preview">${escapeHtml(ann.content.substring(0, 60))}${ann.content.length > 60 ? '...' : ''}</td>
      <td>${formatDate(ann.date)}</td>
      <td><span class="status-badge status-${ann.status.toLowerCase()}">${ann.status}</span></td>
      <td class="action-icons">
        <i class="fas fa-edit" onclick="editAnnouncement(${ann.id})" style="cursor:pointer;"></i>
        <i class="fas fa-trash-alt" onclick="deleteAnnouncement(${ann.id})" style="cursor:pointer;"></i>
      </td>
    </tr>
  `).join('');

  const published = announcements.filter(a => a.status === 'Published').length;
  const drafts = announcements.filter(a => a.status === 'Draft').length;
  const statsContainer = document.getElementById('announcementStats');
  if (statsContainer) {
    statsContainer.innerHTML = `<div class="stat-card"><h4>Total Announcements</h4><p>${announcements.length}</p></div>
                                <div class="stat-card"><h4>Published</h4><p>${published}</p></div>
                                <div class="stat-card"><h4>Drafts</h4><p>${drafts}</p></div>
                                <div class="stat-card"><h4>Latest</h4><p>${formatDate(announcements[0]?.date) || 'N/A'}</p></div>`;
  }
}

function openAnnouncementModal(announcement = null) {
  const modal = document.getElementById('announcementModal');
  if (announcement) {
    document.getElementById('announcementTitle').value = announcement.title;
    document.getElementById('announcementContent').value = announcement.content;
    document.getElementById('announcementStatus').value = announcement.status;
    editingAnnouncementId = announcement.id;
    document.getElementById('announcementModalTitle').textContent = 'Edit Announcement';
  } else {
    document.getElementById('announcementTitle').value = '';
    document.getElementById('announcementContent').value = '';
    document.getElementById('announcementStatus').value = 'Published';
    editingAnnouncementId = null;
    document.getElementById('announcementModalTitle').textContent = 'Create Announcement';
  }
  modal.style.display = 'flex';
}

function closeAnnouncementModal() {
  document.getElementById('announcementModal').style.display = 'none';
  editingAnnouncementId = null;
}

function saveAnnouncement() {
  const title = document.getElementById('announcementTitle').value.trim();
  const content = document.getElementById('announcementContent').value.trim();
  const status = document.getElementById('announcementStatus').value;

  if (!title) { alert('Enter announcement title'); return; }
  if (!content) { alert('Enter announcement content'); return; }

  const today = new Date().toISOString().slice(0, 10);

  if (editingAnnouncementId !== null) {
    const index = announcements.findIndex(a => a.id === editingAnnouncementId);
    if (index !== -1) {
      announcements[index] = { ...announcements[index], title, content, status };
    }
  } else {
    const newId = announcements.length ? Math.max(...announcements.map(a => a.id)) + 1 : 1;
    announcements.unshift({ id: newId, title, content, date: today, status });
  }
  renderAnnouncements();
  closeAnnouncementModal();
}

function editAnnouncement(id) {
  const announcement = announcements.find(a => a.id === id);
  if (announcement) openAnnouncementModal(announcement);
}

function deleteAnnouncement(id) {
  if (confirm('Delete this announcement?')) {
    announcements = announcements.filter(a => a.id !== id);
    renderAnnouncements();
  }
}

// ========== SECTION TOGGLE ==========
function showSection(id, element) {
  document.querySelectorAll('.item-section').forEach(section => {
    section.classList.remove('active');
  });
  const activeSection = document.getElementById(id);
  if (activeSection) activeSection.classList.add('active');
  
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
  });
  if (element) element.classList.add('active');
  
  if (id === 'delivery-section') renderDeliveries();
  if (id === 'user-section') renderUsers();
  if (id === 'announcement-section') renderAnnouncements();
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  // Product buttons
  const saveProductBtn = document.getElementById('saveProductBtn');
  if (saveProductBtn) saveProductBtn.onclick = saveProduct;
  const cancelProductBtn = document.getElementById('cancelProductBtn');
  if (cancelProductBtn) cancelProductBtn.onclick = closeProductModal;
  const addProductBtn = document.getElementById('addProductBtn');
  if (addProductBtn) addProductBtn.onclick = function() { openProductModal('Add Product'); };
  
  // Delivery buttons
  const saveDeliveryBtn = document.getElementById('saveDeliveryBtn');
  if (saveDeliveryBtn) saveDeliveryBtn.onclick = saveDelivery;
  const cancelDeliveryBtn = document.getElementById('cancelDeliveryBtn');
  if (cancelDeliveryBtn) cancelDeliveryBtn.onclick = closeDeliveryModal;
  const addDeliveryBtn = document.getElementById('addDeliveryBtn');
  if (addDeliveryBtn) addDeliveryBtn.onclick = function() { openDeliveryModal(); };
  
  // User buttons
  const saveUserBtn = document.getElementById('saveUserBtn');
  if (saveUserBtn) saveUserBtn.onclick = saveUser;
  const cancelUserBtn = document.getElementById('cancelUserBtn');
  if (cancelUserBtn) cancelUserBtn.onclick = closeUserModal;
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) addUserBtn.onclick = function() { openUserModal(); };
  
  // Announcement buttons
  const saveAnnouncementBtn = document.getElementById('saveAnnouncementBtn');
  if (saveAnnouncementBtn) saveAnnouncementBtn.onclick = saveAnnouncement;
  const cancelAnnouncementBtn = document.getElementById('cancelAnnouncementBtn');
  if (cancelAnnouncementBtn) cancelAnnouncementBtn.onclick = closeAnnouncementModal;
  const addAnnouncementBtn = document.getElementById('addAnnouncementBtn');
  if (addAnnouncementBtn) addAnnouncementBtn.onclick = function() { openAnnouncementModal(); };
  
  // Close modals when clicking overlay
  const modals = ['productModal', 'deliveryModal', 'userModal', 'announcementModal'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.onclick = function(e) {
        if (e.target === modal) {
          modal.style.display = 'none';
          if (modalId === 'productModal') editingProductId = null;
          if (modalId === 'deliveryModal') editingDeliveryId = null;
          if (modalId === 'userModal') editingUserId = null;
          if (modalId === 'announcementModal') editingAnnouncementId = null;
        }
      };
    }
  });
  
  // Initial renders
  renderProducts();
  renderDeliveries();
  renderUsers();
  renderAnnouncements();
});

function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) navLinks.classList.toggle('active');
}

// Store original render functions
const originalRenderProducts = window.renderProducts;
const originalRenderDeliveries = window.renderDeliveries;
const originalRenderUsers = window.renderUsers;
const originalRenderAnnouncements = window.renderAnnouncements;

// Search filter variables
let productFilterText = '';
let deliveryFilterText = '';
let userFilterText = '';
let announcementFilterText = '';

// Filter Products
function filterProducts() {
  const searchInput = document.getElementById('productSearchInput');
  productFilterText = searchInput ? searchInput.value.toLowerCase().trim() : '';
  applyProductFilter();
}

function clearProductSearch() {
  const searchInput = document.getElementById('productSearchInput');
  if (searchInput) {
    searchInput.value = '';
    productFilterText = '';
    applyProductFilter();
  }
}

function applyProductFilter() {
  if (!window.products) return;
  
  const filteredProducts = window.products.filter(product => {
    if (!productFilterText) return true;
    return (product.name && product.name.toLowerCase().includes(productFilterText)) ||
           (product.category && product.category.toLowerCase().includes(productFilterText));
  });
  
  // Temporarily override products for display
  const originalProducts = window.products;
  window.products = filteredProducts;
  if (window.renderProducts) window.renderProducts();
  window.products = originalProducts;
}

// Filter Deliveries
function filterDeliveries() {
  const searchInput = document.getElementById('deliverySearchInput');
  deliveryFilterText = searchInput ? searchInput.value.toLowerCase().trim() : '';
  applyDeliveryFilter();
}

function clearDeliverySearch() {
  const searchInput = document.getElementById('deliverySearchInput');
  if (searchInput) {
    searchInput.value = '';
    deliveryFilterText = '';
    applyDeliveryFilter();
  }
}

function applyDeliveryFilter() {
  if (!window.deliveries) return;
  
  const filteredDeliveries = window.deliveries.filter(delivery => {
    if (!deliveryFilterText) return true;
    return (delivery.customer && delivery.customer.toLowerCase().includes(deliveryFilterText)) ||
           (delivery.product && delivery.product.toLowerCase().includes(deliveryFilterText)) ||
           (delivery.id && delivery.id.toLowerCase().includes(deliveryFilterText));
  });
  
  const originalDeliveries = window.deliveries;
  window.deliveries = filteredDeliveries;
  if (window.renderDeliveries) window.renderDeliveries();
  window.deliveries = originalDeliveries;
}

// Filter Users
function filterUsers() {
  const searchInput = document.getElementById('userSearchInput');
  userFilterText = searchInput ? searchInput.value.toLowerCase().trim() : '';
  applyUserFilter();
}

function clearUserSearch() {
  const searchInput = document.getElementById('userSearchInput');
  if (searchInput) {
    searchInput.value = '';
    userFilterText = '';
    applyUserFilter();
  }
}

function applyUserFilter() {
  if (!window.users) return;
  
  const filteredUsers = window.users.filter(user => {
    if (!userFilterText) return true;
    return (user.name && user.name.toLowerCase().includes(userFilterText)) ||
           (user.email && user.email.toLowerCase().includes(userFilterText));
  });
  
  const originalUsers = window.users;
  window.users = filteredUsers;
  if (window.renderUsers) window.renderUsers();
  window.users = originalUsers;
}

// Filter Announcements
function filterAnnouncements() {
  const searchInput = document.getElementById('announcementSearchInput');
  announcementFilterText = searchInput ? searchInput.value.toLowerCase().trim() : '';
  applyAnnouncementFilter();
}

function clearAnnouncementSearch() {
  const searchInput = document.getElementById('announcementSearchInput');
  if (searchInput) {
    searchInput.value = '';
    announcementFilterText = '';
    applyAnnouncementFilter();
  }
}

function applyAnnouncementFilter() {
  if (!window.announcements) return;
  
  const filteredAnnouncements = window.announcements.filter(announcement => {
    if (!announcementFilterText) return true;
    return (announcement.title && announcement.title.toLowerCase().includes(announcementFilterText)) ||
           (announcement.content && announcement.content.toLowerCase().includes(announcementFilterText));
  });
  
  const originalAnnouncements = window.announcements;
  window.announcements = filteredAnnouncements;
  if (window.renderAnnouncements) window.renderAnnouncements();
  window.announcements = originalAnnouncements;
}

// Override render functions to maintain search after updates
if (typeof renderProducts !== 'undefined') {
  const originalRenderProductsFn = renderProducts;
  renderProducts = function() {
    originalRenderProductsFn();
    if (productFilterText) applyProductFilter();
  };
}

if (typeof renderDeliveries !== 'undefined') {
  const originalRenderDeliveriesFn = renderDeliveries;
  renderDeliveries = function() {
    originalRenderDeliveriesFn();
    if (deliveryFilterText) applyDeliveryFilter();
  };
}

if (typeof renderUsers !== 'undefined') {
  const originalRenderUsersFn = renderUsers;
  renderUsers = function() {
    originalRenderUsersFn();
    if (userFilterText) applyUserFilter();
  };
}

if (typeof renderAnnouncements !== 'undefined') {
  const originalRenderAnnouncementsFn = renderAnnouncements;
  renderAnnouncements = function() {
    originalRenderAnnouncementsFn();
    if (announcementFilterText) applyAnnouncementFilter();
  };
}