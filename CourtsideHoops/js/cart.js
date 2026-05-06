const CourtsideCart = (function() {
    'use strict';
    
    // ============================================
    // Private Variables
    // ============================================
    const STORAGE_KEY = 'courtsideCart';
    const TAX_RATE = 0.12; // 12% VAT
    const FREE_SHIPPING_THRESHOLD = 1000; // ₱1000 minimum for free shipping
    const SHIPPING_COST = 99;
    
    let cart = [];
    let listeners = [];
    
    // ============================================
    // Private Helper Functions
    // ============================================
    
    /**
     * Load cart from localStorage
     */
    function loadFromStorage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                cart = JSON.parse(saved);
                // Ensure each item has required fields
                cart = cart.filter(item => item && item.id).map(item => ({
                    ...item,
                    quantity: item.quantity || 1,
                    price: parseInt(item.price) || 0
                }));
            } catch (e) {
                console.error('Failed to load cart:', e);
                cart = [];
            }
        } else {
            cart = [];
        }
        notifyListeners();
    }
    
    /**
     * Save cart to localStorage
     */
    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        notifyListeners();
    }
    
    /**
     * Generate unique ID for cart item
     */
    function generateId() {
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Notify all listeners of cart changes
     */
    function notifyListeners() {
        listeners.forEach(listener => {
            try {
                listener(cart);
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    }
    
    /**
     * Format price with currency
     * @param {number} price - Price to format
     * @returns {string} Formatted price
     */
    function formatPrice(price) {
        return `₱${parseInt(price || 0).toLocaleString()}`;
    }
    
    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', 'info'
     */
    function showToast(message, type = 'success') {
        const toast = document.getElementById('cartToast');
        if (!toast) {
            // Create toast if it doesn't exist
            createToastElement();
        }
        
        const toastEl = document.getElementById('cartToast');
        if (toastEl) {
            const icon = toastEl.querySelector('i');
            const text = toastEl.querySelector('span');
            
            // Set icon based on type
            if (icon) {
                icon.className = type === 'success' ? 'fas fa-check-circle' : 
                                type === 'error' ? 'fas fa-exclamation-circle' : 
                                'fas fa-info-circle';
                icon.style.color = type === 'success' ? '#22c55e' : 
                                  type === 'error' ? '#ef4444' : 
                                  '#3b82f6';
            }
            
            if (text) text.textContent = message;
            toastEl.classList.add('show');
            
            setTimeout(() => {
                toastEl.classList.remove('show');
            }, 2500);
        }
    }
    
    /**
     * Create toast notification element
     */
    function createToastElement() {
        const toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.className = 'cart-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Item added to cart</span>
        `;
        document.body.appendChild(toast);
        
        // Add styles if not present
        if (!document.querySelector('#cartToastStyles')) {
            const styles = document.createElement('style');
            styles.id = 'cartToastStyles';
            styles.textContent = `
                .cart-toast {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: var(--surface, white);
                    color: var(--text, #111);
                    padding: 12px 24px;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    font-weight: 500;
                    border: 1px solid var(--border, #e5e7eb);
                }
                .cart-toast.show {
                    transform: translateX(0);
                }
                .cart-toast i {
                    font-size: 18px;
                }
                body.dark .cart-toast {
                    background: #1a1a1a;
                    color: #eee;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    // ============================================
    // Public API
    // ============================================
    
    /**
     * Initialize cart module
     * @param {Object} options - Configuration options
     */
    function init(options = {}) {
        loadFromStorage();
        
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) {
                cart = JSON.parse(e.newValue) || [];
                notifyListeners();
            }
        });
        
        // Update cart badge on all pages
        updateBadge();
        
        // Initialize add to cart buttons if on market page
        if (options.autoBindButtons !== false) {
            bindAddToCartButtons();
        }
    }
    
    /**
     * Get all cart items
     * @returns {Array} Array of cart items
     */
    function getItems() {
        return [...cart];
    }
    
    /**
     * Get total number of items in cart
     * @returns {number} Total item count
     */
    function getItemCount() {
        return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    
    /**
     * Get cart subtotal
     * @returns {number} Subtotal amount
     */
    function getSubtotal() {
        return cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    }
    
    /**
     * Get shipping cost
     * @returns {number} Shipping cost
     */
    function getShippingCost() {
        const subtotal = getSubtotal();
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    }
    
    /**
     * Get tax amount
     * @returns {number} Tax amount
     */
    function getTax() {
        return getSubtotal() * TAX_RATE;
    }
    
    /**
     * Get cart total
     * @returns {number} Total amount
     */
    function getTotal() {
        return getSubtotal() + getShippingCost() + getTax();
    }
    
    /**
     * Get cart summary object
     * @returns {Object} Cart summary
     */
    function getSummary() {
        return {
            subtotal: getSubtotal(),
            shipping: getShippingCost(),
            tax: getTax(),
            total: getTotal(),
            itemCount: getItemCount(),
            freeShippingEligible: getSubtotal() >= FREE_SHIPPING_THRESHOLD
        };
    }
    
    /**
     * Add item to cart
     * @param {Object} item - Item to add
     * @param {string} item.name - Product name
     * @param {number} item.price - Product price
     * @param {string} item.img - Product image URL
     * @param {string} item.rarity - Product rarity
     * @returns {boolean} Success status
     */
    function addItem(item) {
        if (!item.name || !item.price) {
            console.error('Invalid item:', item);
            return false;
        }
        
        const existingItem = cart.find(cartItem => cartItem.name === item.name);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            showToast(`${item.name} quantity updated!`, 'success');
        } else {
            cart.push({
                id: generateId(),
                name: item.name,
                price: parseInt(item.price) || 0,
                quantity: 1,
                img: item.img || '',
                rarity: item.rarity || 'Common'
            });
            showToast(`${item.name} added to cart!`, 'success');
        }
        
        saveToStorage();
        updateBadge();
        return true;
    }
    
    /**
     * Update item quantity
     * @param {string} itemId - ID of item to update
     * @param {number} change - Change in quantity (+1 or -1)
     * @returns {boolean} Success status
     */
    function updateQuantity(itemId, change) {
        const index = cart.findIndex(item => item.id === itemId);
        if (index === -1) return false;
        
        const newQuantity = (cart[index].quantity || 1) + change;
        
        if (newQuantity >= 1) {
            cart[index].quantity = newQuantity;
        } else if (newQuantity === 0) {
            cart.splice(index, 1);
        }
        
        saveToStorage();
        updateBadge();
        return true;
    }
    
    /**
     * Remove item from cart
     * @param {string} itemId - ID of item to remove
     * @returns {boolean} Success status
     */
    function removeItem(itemId) {
        const index = cart.findIndex(item => item.id === itemId);
        if (index === -1) return false;
        
        const itemName = cart[index].name;
        cart.splice(index, 1);
        saveToStorage();
        updateBadge();
        showToast(`${itemName} removed from cart`, 'info');
        return true;
    }
    
    /**
     * Remove item by index (for cart page rendering)
     * @param {number} index - Index of item to remove
     * @returns {boolean} Success status
     */
    function removeItemByIndex(index) {
        if (index >= 0 && index < cart.length) {
            const itemName = cart[index].name;
            cart.splice(index, 1);
            saveToStorage();
            updateBadge();
            showToast(`${itemName} removed from cart`, 'info');
            return true;
        }
        return false;
    }
    
    /**
     * Clear entire cart
     */
    function clearCart() {
        if (cart.length > 0) {
            cart = [];
            saveToStorage();
            updateBadge();
            showToast('Cart cleared', 'info');
        }
    }
    
    /**
     * Update cart badge in navbar
     */
    function updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const itemCount = getItemCount();
        
        badges.forEach(badge => {
            if (itemCount > 0) {
                badge.style.display = 'flex';
                badge.textContent = itemCount > 99 ? '99+' : itemCount;
            } else {
                badge.style.display = 'none';
            }
        });
    }
    
    /**
     * Bind add to cart buttons on the page
     */
    function bindAddToCartButtons() {
        const buttons = document.querySelectorAll('.add-btn');
        
        buttons.forEach(button => {
            // Remove existing listener to avoid duplicates
            button.removeEventListener('click', handleAddToCartClick);
            button.addEventListener('click', handleAddToCartClick);
        });
    }
    
    /**
     * Handle add to cart button click
     * @param {Event} event - Click event
     */
    function handleAddToCartClick(event) {
        event.stopPropagation();
        
        const card = this.closest('.card');
        if (!card) return;
        
        const item = {
            name: card.dataset.name || card.querySelector('h4')?.innerText,
            price: card.dataset.price || card.querySelector('p')?.innerText.replace(/[^0-9]/g, ''),
            img: card.dataset.img || card.querySelector('img')?.src,
            rarity: card.dataset.rarity
        };
        
        if (addItem(item)) {
            // Visual feedback
            const originalText = this.textContent;
            const originalBg = this.style.background;
            this.textContent = '✓ Added!';
            this.style.background = '#22c55e';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = originalBg;
            }, 1000);
        }
    }
    
    /**
     * Subscribe to cart changes
     * @param {Function} callback - Function to call on cart change
     * @returns {Function} Unsubscribe function
     */
    function subscribe(callback) {
        if (typeof callback === 'function') {
            listeners.push(callback);
            // Call immediately with current cart
            callback(cart);
            
            // Return unsubscribe function
            return () => {
                listeners = listeners.filter(cb => cb !== callback);
            };
        }
        return () => {};
    }
    
    /**
     * Format price for display
     * @param {number} price - Price to format
     * @returns {string} Formatted price
     */
    function formatCurrency(price) {
        return formatPrice(price);
    }
    
    // ============================================
    // Cart UI Renderer for Cart Page
    // ============================================
    
    /**
     * Render cart page UI
     * @param {HTMLElement} container - Container element
     */
    function renderCartPage(container) {
        if (!container) return;
        
        const items = getItems();
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="market.html" class="shop-now-btn">Start Shopping →</a>
                </div>
            `;
            return;
        }
        
        let itemsHtml = '<div class="cart-grid">';
        let subtotal = 0;
        
        items.forEach((item, index) => {
            const quantity = item.quantity || 1;
            const itemPrice = item.price || 0;
            const itemTotal = itemPrice * quantity;
            subtotal += itemTotal;
            
            itemsHtml += `
                <div class="cart-item" data-item-id="${item.id}" data-item-index="${index}">
                    <img src="${item.img || 'https://via.placeholder.com/100'}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100'">
                    <div class="cart-item-details">
                        <h4>${escapeHtml(item.name)}</h4>
                        <div class="cart-item-price">${formatPrice(itemPrice)}</div>
                        ${item.rarity ? `<small class="rarity-label rarity-${item.rarity.toLowerCase()}">${item.rarity}</small>` : ''}
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button class="quantity-btn" data-index="${index}" data-change="-1">−</button>
                            <span class="quantity-value">${quantity}</span>
                            <button class="quantity-btn" data-index="${index}" data-change="1">+</button>
                        </div>
                        <button class="remove-btn" data-index="${index}">Remove</button>
                    </div>
                </div>
            `;
        });
        
        const summary = getSummary();
        
        itemsHtml += '</div>';
        itemsHtml += `
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${formatPrice(summary.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>${summary.shipping === 0 ? 'FREE' : formatPrice(summary.shipping)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (12% VAT)</span>
                    <span>${formatPrice(summary.tax)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span class="amount">${formatPrice(summary.total)}</span>
                </div>
                <div class="summary-actions">
                    <button class="checkout-btn" id="checkoutBtn">Proceed to Checkout</button>
                    <button class="clear-btn" id="clearCartBtn">Clear Cart</button>
                </div>
            </div>
        `;
        
        container.innerHTML = itemsHtml;
        
        // Bind cart page events
        bindCartPageEvents(container);
    }
    
    /**
     * Bind events for cart page
     * @param {HTMLElement} container - Container element
     */
    function bindCartPageEvents(container) {
        // Quantity buttons
        container.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.removeEventListener('click', handleQuantityClick);
            btn.addEventListener('click', handleQuantityClick);
        });
        
        // Remove buttons
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.removeEventListener('click', handleRemoveClick);
            btn.addEventListener('click', handleRemoveClick);
        });
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.removeEventListener('click', handleCheckoutClick);
            checkoutBtn.addEventListener('click', handleCheckoutClick);
        }
        
        // Clear cart button
        const clearBtn = document.getElementById('clearCartBtn');
        if (clearBtn) {
            clearBtn.removeEventListener('click', handleClearCartClick);
            clearBtn.addEventListener('click', handleClearCartClick);
        }
    }
    
    /**
     * Handle quantity button click
     * @param {Event} event - Click event
     */
    function handleQuantityClick(event) {
        const index = parseInt(this.dataset.index);
        const change = parseInt(this.dataset.change);
        
        if (!isNaN(index) && !isNaN(change)) {
            updateQuantityByIndex(index, change);
        }
    }
    
    /**
     * Update quantity by index
     * @param {number} index - Item index
     * @param {number} change - Quantity change
     */
    function updateQuantityByIndex(index, change) {
        const item = cart[index];
        if (item) {
            const newQuantity = (item.quantity || 1) + change;
            
            if (newQuantity >= 1) {
                cart[index].quantity = newQuantity;
                saveToStorage();
                updateBadge();
                
                // Re-render cart page if exists
                const container = document.getElementById('cart-container');
                if (container) renderCartPage(container);
            } else if (newQuantity === 0) {
                removeItemByIndex(index);
                const container = document.getElementById('cart-container');
                if (container) renderCartPage(container);
            }
        }
    }
    
    /**
     * Handle remove button click
     * @param {Event} event - Click event
     */
    function handleRemoveClick(event) {
        const index = parseInt(this.dataset.index);
        if (!isNaN(index)) {
            removeItemByIndex(index);
            const container = document.getElementById('cart-container');
            if (container) renderCartPage(container);
        }
    }
    
    /**
     * Handle checkout button click
     */
    function handleCheckoutClick() {
        if (getItemCount() === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }
        openCheckoutModal();
    }
    
    /**
     * Handle clear cart button click
     */
    function handleClearCartClick() {
        if (confirm('Are you sure you want to clear your entire cart?')) {
            clearCart();
            const container = document.getElementById('cart-container');
            if (container) renderCartPage(container);
            closeCheckoutModal();
        }
    }
    
    /**
     * Open checkout modal
     */
    function openCheckoutModal() {
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('checkout');
        if (overlay && modal) {
            overlay.classList.add('active');
            modal.classList.add('active');
        }
    }
    
    /**
     * Close checkout modal
     */
    function closeCheckoutModal() {
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('checkout');
        if (overlay && modal) {
            overlay.classList.remove('active');
            modal.classList.remove('active');
        }
        
        // Clear payment sections
        const qrSection = document.getElementById('qr-section');
        const cardSection = document.getElementById('card-section');
        if (qrSection) qrSection.innerHTML = '';
        if (qrSection) qrSection.style.display = 'none';
        if (cardSection) cardSection.style.display = 'none';
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // ============================================
    // Public Exports
    // ============================================
    
    return {
        init,
        getItems,
        getItemCount,
        getSubtotal,
        getShippingCost,
        getTax,
        getTotal,
        getSummary,
        addItem,
        updateQuantity,
        removeItem,
        removeItemByIndex,
        clearCart,
        updateBadge,
        bindAddToCartButtons,
        subscribe,
        formatCurrency,
        renderCartPage,
        openCheckoutModal,
        closeCheckoutModal
    };
})();

// ============================================
// Initialize on DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart
    CourtsideCart.init();
    
    // If on cart page, render cart
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) {
        CourtsideCart.renderCartPage(cartContainer);
        
        // Subscribe to cart changes to re-render
        CourtsideCart.subscribe(() => {
            CourtsideCart.renderCartPage(cartContainer);
        });
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CourtsideCart;
}