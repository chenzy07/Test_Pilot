let inventoryData = [
  { id: 1001, name: "LeBron James 2003 Topps Chrome Rookie", category: "Rookie Card", price: 899.99, stock: 1, image: "👑🏀" },
  { id: 1002, name: "Michael Jordan 1986 Fleer #57", category: "Vintage", price: 2499.99, stock: 1, image: "🐐" },
  { id: 1003, name: "Stephen Curry 2009 Topps Autograph", category: "Autograph Card", price: 649.99, stock: 2, image: "✍️🏀" },
  { id: 1004, name: "Kobe Bryant 1996 Topps Chrome Refractor", category: "Rookie Card", price: 1299.99, stock: 1, image: "💜💛" },
  { id: 1005, name: "Luka Doncic 2018 Prizm Silver", category: "Parallel/Insert", price: 349.99, stock: 3, image: "⭐" },
  { id: 1006, name: "Giannis Antetokounmpo 2013 Panini Prizm", category: "Rookie Card", price: 449.99, stock: 2, image: "🦌" }
];

let onsaleData = [
  { id: 2001, name: "Kevin Durant 2007 Topps Chrome RC", category: "Rookie Card", price: 379.99, stock: 1, image: "🔟" },
  { id: 2002, name: "Shaquille O'Neal 1992 Topps Gold", category: "Vintage", price: 189.99, stock: 1, image: "💪" },
  { id: 2003, name: "Zion Williamson 2019 Prizm Blue", category: "Parallel/Insert", price: 129.99, stock: 2, image: "⚡" }
];

// Render inventory table with ID as first column (no image column)
function renderInventoryTable() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  inventoryData.forEach(item => {
    const row = tbody.insertRow();
    row.insertCell(0).innerHTML = `<strong>${item.id}</strong>`;
    row.insertCell(1).innerHTML = `<strong>${escapeHtml(item.name)}</strong>`;
    row.insertCell(2).innerText = item.category;
    row.insertCell(3).innerText = `₱${item.price.toFixed(2)}`;
    row.insertCell(4).innerText = item.stock;
    row.insertCell(5).innerHTML = `<div class="action-buttons"><button class="btn-small" onclick="editInventoryItem(${item.id})">Edit</button><button class="btn-small-outline" onclick="moveToSale(${item.id})">Sell</button></div>`;
  });
}

// Render onsale table with ID as first column
function renderOnsaleTable() {
  const tbody = document.getElementById('onsale-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  onsaleData.forEach(item => {
    const row = tbody.insertRow();
    row.insertCell(0).innerHTML = `<strong>${item.id}</strong>`;
    row.insertCell(1).innerHTML = `<strong>${escapeHtml(item.name)}</strong>`;
    row.insertCell(2).innerText = item.category;
    row.insertCell(3).innerText = `₱${item.price.toFixed(2)}`;
    row.insertCell(4).innerText = item.stock > 0 ? item.stock : 'Out of stock';
    row.insertCell(5).innerHTML = `<div class="action-buttons"><button class="btn-small" onclick="editOnSaleItem(${item.id})">Manage</button><button class="btn-small-outline" onclick="removeFromSale(${item.id})">Remove</button></div>`;
  });
}

// Add new NBA card (only basketball cards)
function addSampleCard() {
  const newId = Math.floor(Math.random() * 9000) + 3000;
  const newCard = {
    id: newId,
    name: "Victor Wembanyama 2023 Prizm RC",
    category: "Rookie Card",
    price: 299.99,
    stock: 5,
    image: "🦒🏀"
  };
  inventoryData.push(newCard);
  renderInventoryTable();
  alert(`Added new NBA card: ${newCard.name} (ID: ${newId})`);
}

function moveToSale(inventoryId) {
  const itemIndex = inventoryData.findIndex(i => i.id === inventoryId);
  if (itemIndex !== -1) {
    const item = { ...inventoryData[itemIndex], id: Date.now() + Math.floor(Math.random() * 10000) };
    onsaleData.push(item);
    inventoryData.splice(itemIndex, 1);
    renderInventoryTable();
    renderOnsaleTable();
    alert(`${item.name} moved to Items on Sale!`);
  }
}

function editInventoryItem(id) {
  const item = inventoryData.find(i => i.id === id);
  if (item) {
    const newPrice = prompt(`Edit price for ${item.name} (current: ₱${item.price})`, item.price);
    if (newPrice && !isNaN(parseFloat(newPrice))) item.price = parseFloat(newPrice);
    const newStock = prompt(`Edit stock for ${item.name} (current: ${item.stock})`, item.stock);
    if (newStock && !isNaN(parseInt(newStock))) item.stock = parseInt(newStock);
    renderInventoryTable();
  } else {
    alert("Item not found");
  }
}

function editOnSaleItem(id) {
  const item = onsaleData.find(i => i.id === id);
  if (item) {
    const newPrice = prompt(`Edit price for ${item.name} (current: ₱${item.price})`, item.price);
    if (newPrice && !isNaN(parseFloat(newPrice))) item.price = parseFloat(newPrice);
    const newStock = prompt(`Edit stock for ${item.name} (current: ${item.stock})`, item.stock);
    if (newStock && !isNaN(parseInt(newStock))) item.stock = parseInt(newStock);
    renderOnsaleTable();
  }
}

function removeFromSale(saleId) {
  if (confirm("Remove this item from sale?")) {
    onsaleData = onsaleData.filter(i => i.id !== saleId);
    renderOnsaleTable();
    alert("Item removed from sale.");
  }
}

let quickSaleFeedItems = [];

function addQuickSaleItem() {
  const name = document.getElementById('qs-product-name')?.value;
  const category = document.getElementById('qs-category')?.value;
  const price = parseFloat(document.getElementById('qs-price')?.value);
  const stock = parseInt(document.getElementById('qs-stock')?.value);
  const imageUrl = document.getElementById('qs-image-url')?.value || "";
  
  if (!name || isNaN(price) || price <= 0) {
    alert("Please fill card name and valid price.");
    return;
  }
  if (isNaN(stock) || stock < 1) {
    alert("Stock must be at least 1.");
    return;
  }
  
  const newId = Date.now() + Math.floor(Math.random() * 10000);
  const newItem = {
    id: newId,
    name: name,
    category: category,
    price: price,
    stock: stock,
    image: imageUrl || "🃏",
    isImageUrl: imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
  };
  
  onsaleData.unshift(newItem);
  quickSaleFeedItems.unshift(newItem);
  renderOnsaleTable();
  updateQuickSaleFeed();
  
  document.getElementById('qs-product-name').value = '';
  document.getElementById('qs-price').value = '';
  document.getElementById('qs-stock').value = '1';
  document.getElementById('qs-image-url').value = '';
  
  // Reset preview
  const previewBox = document.getElementById('quick-image-preview');
  if (previewBox) previewBox.innerHTML = '🃏';
  
  alert(`✅ "${name}" listed for sale! Card ID: ${newId}`);
}

function updateQuickSaleFeed() {
  const feedDiv = document.getElementById('quick-sale-feed');
  if (!feedDiv) return;
  if (quickSaleFeedItems.length === 0) {
    feedDiv.innerHTML = '<p>No recent quick sales. List a card above!</p>';
    return;
  }
  feedDiv.innerHTML = quickSaleFeedItems.slice(0, 4).map(item => {
    let imageDisplay;
    if (item.isImageUrl) {
      imageDisplay = `<img src="${item.image}" style="width:45px; height:45px; object-fit:cover; border-radius:8px;" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\'font-size:28px;\'>🃏</div>';">`;
    } else {
      imageDisplay = `<div style="font-size:28px; min-width:45px; text-align:center;">${item.image || '🃏'}</div>`;
    }
    
    return `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:#f9f9f9; padding:8px; border-radius:8px;">
        ${imageDisplay}
        <div><strong>${escapeHtml(item.name)}</strong><br>ID: ${item.id} | ₱${item.price.toFixed(2)} | Stock: ${item.stock}</div>
      </div>
    `;
  }).join('');
  
  if (document.body.classList.contains('dark')) {
    const darkItems = feedDiv.querySelectorAll('div[style*="background:#f9f9f9"]');
    darkItems.forEach(el => el.style.backgroundColor = '#1f1f1f');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function setupImagePreview() {
  const urlInput = document.getElementById('qs-image-url');
  const previewBox = document.getElementById('quick-image-preview');
  if (urlInput && previewBox) {
    urlInput.addEventListener('input', function(e) {
      let val = e.target.value.trim();
      if (val && (val.startsWith('http://') || val.startsWith('https://'))) {
        // Display actual image from URL
        previewBox.innerHTML = `<img src="${val}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" onerror="this.onerror=null; this.parentElement.innerHTML='🃏';">`;
      } else if (val && val.length <= 4 && !val.includes('.')) {
        // Show emoji if short text (likely emoji)
        previewBox.innerHTML = val;
      } else if (val && val.length > 0) {
        // Show text preview
        previewBox.innerHTML = val.slice(0, 4);
      } else {
        // Default card icon
        previewBox.innerHTML = '🃏';
      }
    });
  }
}

function showSection(sectionId, event) {
  const sections = ['account-section', 'inventory-section', 'isale-section', 'qsale-section'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden-section');
      el.classList.remove('active-section');
    }
  });
  
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.remove('hidden-section');
    activeSection.classList.add('active-section');
  }
  
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
  if (event && event.currentTarget) event.currentTarget.classList.add('active');
  
  if (sectionId === 'inventory-section') renderInventoryTable();
  if (sectionId === 'isale-section') renderOnsaleTable();
  if (sectionId === 'qsale-section') {
    updateQuickSaleFeed();
    setupImagePreview();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderInventoryTable();
  renderOnsaleTable();
  updateQuickSaleFeed();
  setupImagePreview();
  document.getElementById('account-section').classList.add('active-section');
  document.getElementById('account-section').classList.remove('hidden-section');
});