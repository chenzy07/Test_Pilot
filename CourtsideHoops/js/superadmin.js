(function initDarkMode() {
    const toggleBtn = document.getElementById('darkModeToggle');
    const icon = document.getElementById('darkIcon');
    const textSpan = document.getElementById('darkModeText');
    
    if (!toggleBtn) return;
    
    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark");
      if (icon) icon.className = "fas fa-sun";
      if (textSpan) textSpan.textContent = " Light Mode";
    } else {
      document.body.classList.remove("dark");
      if (icon) icon.className = "fas fa-moon";
      if (textSpan) textSpan.textContent = " Dark Mode";
    }
    
    toggleBtn.addEventListener("click", function () {
      document.body.classList.toggle("dark");
      
      if (document.body.classList.contains("dark")) {
        localStorage.setItem("darkMode", "enabled");
        if (icon) icon.className = "fas fa-sun";
        if (textSpan) textSpan.textContent = " Light Mode";
      } else {
        localStorage.setItem("darkMode", "disabled");
        if (icon) icon.className = "fas fa-moon";
        if (textSpan) textSpan.textContent = " Dark Mode";
      }
    });
  })();

  // ========== SUPER ADMIN STATE ==========
  let adminAccounts = [
    { id: 1, username: "Sarah Johnson", email: "sarah@courtsidehoops.com", role: "admin", status: "active" },
    { id: 2, username: "Mike Chen", email: "mike@courtsidehoops.com", role: "manager", status: "active" },
    { id: 3, username: "Jordan Taylor", email: "jordan@courtsidehoops.com", role: "supervisor", status: "active" }
  ];
  let nextAdminId = 4;
  let editMode = false;
  let editAdminId = null;
  let currentAdminFilter = '';

  let revenueChart, rolesChart, ordersChart, deliveryChart;

  // Sidebar Toggle Function
  window.switchSuperSection = function(sectionId, element) {
    document.querySelectorAll('.super-section').forEach(section => {
      section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
    });
    element.classList.add('active');
    
    if (sectionId === 'analytics-section') {
      setTimeout(() => {
        if (revenueChart) revenueChart.update();
        if (rolesChart) updateRoleChartData();
        if (ordersChart) ordersChart.update();
        if (deliveryChart) deliveryChart.update();
      }, 100);
    } else if (sectionId === 'admin-users-section') {
      renderAdminTable(currentAdminFilter);
    }
  };

  function loadPlatformStats() {
    document.getElementById('totalProductsCount').innerText = "24";
    document.getElementById('totalDeliveriesCount').innerText = "18";
    document.getElementById('liveAnnouncementsCount').innerText = "5";
    document.getElementById('totalAdminsCount').innerText = adminAccounts.length;
  }

  function initCharts() {
    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    const ctxRoles = document.getElementById('rolesChart').getContext('2d');
    const ctxOrders = document.getElementById('ordersChart').getContext('2d');
    const ctxDelivery = document.getElementById('deliveryStatusChart').getContext('2d');

    revenueChart = new Chart(ctxRevenue, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ label: 'Revenue ($)', data: [4200, 5800, 7200, 8900, 10400, 12800], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.3, fill: true }]
      },
      options: { responsive: true }
    });
    
    rolesChart = new Chart(ctxRoles, {
      type: 'bar',
      data: { labels: ['Admins', 'Managers', 'Supervisors'], datasets: [{ label: 'Account Count', data: [0,0,0], backgroundColor: ['#ef4444', '#f97316', '#3b82f6'] }] },
      options: { responsive: true, scales: { y: { beginAtZero: true, stepSize: 1 } } }
    });
    
    ordersChart = new Chart(ctxOrders, {
      type: 'line',
      data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ label: 'Orders', data: [18, 24, 22, 29, 42, 55, 48], borderColor: '#ef4444', fill: true }] },
      options: { responsive: true }
    });
    
    deliveryChart = new Chart(ctxDelivery, {
      type: 'doughnut',
      data: { labels: ['Processing', 'Shipped', 'Delivered', 'Pending'], datasets: [{ data: [28, 35, 52, 18], backgroundColor: ['#f97316', '#3b82f6', '#22c55e', '#6b7280'] }] },
      options: { responsive: true }
    });
    updateRoleChartData();
  }

  function updateRoleChartData() {
    if (!rolesChart) return;
    rolesChart.data.datasets[0].data = [
      adminAccounts.filter(a => a.role === 'admin').length,
      adminAccounts.filter(a => a.role === 'manager').length,
      adminAccounts.filter(a => a.role === 'supervisor').length
    ];
    rolesChart.update();
  }

  function renderAdminTable(filter = '') {
    const tbody = document.getElementById('adminTableBody');
    let filtered = [...adminAccounts];
    if (filter.trim()) {
      const lower = filter.toLowerCase();
      filtered = filtered.filter(acc => acc.username.toLowerCase().includes(lower) || acc.email.toLowerCase().includes(lower));
    }
    
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No admin accounts found.</td></tr>';
      return;
    }
    
    let html = '';
    filtered.forEach(acc => {
      let roleBadge = acc.role === 'admin' ? '<span class="role-badge-admin"> Admin</span>' : 
                      (acc.role === 'manager' ? '<span class="role-badge-admin" style="background:#8b5cf620; color:#8b5cf6;"> Manager</span>' : 
                      '<span class="role-badge-admin" style="background:#3b82f620; color:#3b82f6;"> Supervisor</span>');
      let statusBadge = acc.status === 'active' ? '<span style="background:#22c55e20; color:#15803d; padding:4px 10px; border-radius:40px;">Active</span>' : '<span style="background:#ef444420; color:#b91c1c; padding:4px 10px; border-radius:40px;">Suspended</span>';
      
      html += `<tr>
        <td>${acc.id}</td>
        <td><i class="fas fa-user-circle"></i> ${escapeHtml(acc.username)}</td>
        <td>${escapeHtml(acc.email)}</td>
        <td>${roleBadge}</td>
        <td>${statusBadge}</td>
        <td class="action-icons">
          <i class="fas fa-edit" onclick="editAdminAccount(${acc.id})"></i>
          <i class="fas fa-trash-alt" onclick="deleteAdminAccount(${acc.id})"></i>
          ${acc.status === 'active' ? '<i class="fas fa-ban" onclick="toggleSuspend('+acc.id+')"></i>' : '<i class="fas fa-check-circle" onclick="toggleSuspend('+acc.id+')"></i>'}
        </td>
      </tr>`;
    });
    tbody.innerHTML = html;
    document.getElementById('totalAdminsCount').innerText = adminAccounts.length;
    updateRoleChartData();
  }

  function escapeHtml(str) { return str.replace(/[&<>]/g, function(m) { return m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'; }); }
  function filterAdminAccounts() { currentAdminFilter = document.getElementById('adminSearchInput').value; renderAdminTable(currentAdminFilter); }
  function clearAdminSearch() { document.getElementById('adminSearchInput').value = ''; currentAdminFilter = ''; renderAdminTable(''); }

  const modal = document.getElementById('adminModal');
  const modalTitle = document.getElementById('adminModalTitle');
  const usernameInput = document.getElementById('adminUsername');
  const emailInput = document.getElementById('adminEmail');
  const roleSelect = document.getElementById('adminRoleSelect');
  const passwordInput = document.getElementById('adminPassword');
  const saveBtn = document.getElementById('saveAdminBtn');
  const cancelBtn = document.getElementById('cancelAdminBtn');

  function openModal(isEdit = false, data = null) {
    modal.style.display = 'flex';
    if (isEdit && data) {
      editMode = true; editAdminId = data.id;
      modalTitle.innerText = 'Edit Admin Account';
      usernameInput.value = data.username; emailInput.value = data.email; roleSelect.value = data.role;
      passwordInput.value = ''; passwordInput.placeholder = 'Leave blank to keep password';
    } else {
      editMode = false; editAdminId = null;
      modalTitle.innerText = 'Create Admin Account';
      usernameInput.value = ''; emailInput.value = ''; roleSelect.value = 'admin'; passwordInput.value = '';
      passwordInput.placeholder = 'Password (min 4 chars)';
    }
  }
  function closeModal() { modal.style.display = 'none'; }
  
  function saveAdminAccount() {
    const username = usernameInput.value.trim(), email = emailInput.value.trim(), role = roleSelect.value, password = passwordInput.value.trim();
    if (!username || !email) { alert('Please fill username and email.'); return; }
    if (!email.includes('@')) { alert('Valid email required.'); return; }
    if (!editMode && (!password || password.length < 4)) { alert('Password must be at least 4 characters.'); return; }
    
    if (editMode && editAdminId !== null) {
      const idx = adminAccounts.findIndex(a => a.id === editAdminId);
      if (idx !== -1) { adminAccounts[idx].username = username; adminAccounts[idx].email = email; adminAccounts[idx].role = role; }
      alert('Account updated.');
    } else {
      if (adminAccounts.some(a => a.email === email)) { alert('Email already exists.'); return; }
      adminAccounts.push({ id: nextAdminId++, username, email, role, status: 'active' });
      alert('Admin account created.');
    }
    closeModal(); renderAdminTable(currentAdminFilter);
  }
  
  function deleteAdminAccount(id) {
    if (!confirm('Delete this admin account?')) return;
    if (adminAccounts.find(a => a.id === id)?.role === 'admin' && adminAccounts.filter(a => a.role === 'admin').length === 1) {
      alert('Cannot delete the only admin account.');
      return;
    }
    adminAccounts = adminAccounts.filter(a => a.id !== id);
    renderAdminTable(currentAdminFilter);
  }
  
  function editAdminAccount(id) { const data = adminAccounts.find(a => a.id === id); if(data) openModal(true, data); }
  function toggleSuspend(id) { const acc = adminAccounts.find(a => a.id === id); if(acc) { acc.status = acc.status === 'active' ? 'suspended' : 'active'; renderAdminTable(currentAdminFilter); } }
  
  document.addEventListener('DOMContentLoaded', () => {
    loadPlatformStats();
    initCharts();
    renderAdminTable('');
    document.getElementById('createAdminBtn')?.addEventListener('click', () => openModal(false));
    document.getElementById('refreshAdminsBtn')?.addEventListener('click', () => { renderAdminTable(currentAdminFilter); loadPlatformStats(); });
    saveBtn?.addEventListener('click', saveAdminAccount);
    cancelBtn?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
    document.getElementById('superLogoutBtn')?.addEventListener('click', () => { window.location.href = '../CourtsideHoops/login.html'; });
  });