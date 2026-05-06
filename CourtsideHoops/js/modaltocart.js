document.addEventListener('DOMContentLoaded', function() {
    initModal();
});

function initModal() {
    const modal = document.getElementById("modal");
    const modalClose = document.getElementById("modalClose");
    const modalImg = document.getElementById("modalImg");
    const modalName = document.getElementById("modalName");
    const modalPrice = document.getElementById("modalPrice");
    const modalRarity = document.getElementById("modalRarity");
    const modalAddToCartBtn = document.getElementById("modalAddToCart");
    
    let scrollY = 0;
    let currentCardData = null;
    let isAddingFromModal = false; // Flag to prevent double addition
    
    // ============================================
    // REMOVE EXISTING LISTENERS TO AVOID DUPLICATES
    // ============================================
    
    // Store original card click handlers to avoid duplicates
    const cards = document.querySelectorAll(".card");
    
    cards.forEach(card => {
        // Remove any existing listeners first
        const oldHandler = card._modalClickHandler;
        if (oldHandler) {
            card.removeEventListener('click', oldHandler);
        }
        
        // Create new handler
        const cardClickHandler = (e) => {
            // Don't open modal if clicking on Add to Cart button
            if (e.target.closest(".add-btn")) {
                e.stopPropagation();
                return;
            }
            
            // Save current card data
            currentCardData = {
                name: card.dataset.name,
                price: card.dataset.price,
                priceDisplay: card.dataset.priceDisplay || `$${card.dataset.price}`,
                rarity: card.dataset.rarity,
                img: card.dataset.img
            };
            
            // Save scroll position
            scrollY = window.scrollY;
            
            // Lock body scroll
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            
          // Populate modal with card data
        if (modalImg) modalImg.src = currentCardData.img;
        if (modalName) modalName.textContent = currentCardData.name;
        if (modalPrice) modalPrice.textContent = currentCardData.priceDisplay;
        if (modalRarity) {
            modalRarity.textContent = currentCardData.rarity;
            modalRarity.className = `rarity-tag rarity-${currentCardData.rarity}`;
        }
            // Show modal
            if (modal) modal.classList.add("active");
        };
        
        // Store handler reference and add listener
        card._modalClickHandler = cardClickHandler;
        card.addEventListener('click', cardClickHandler);
    });
    
    // ============================================
    // CLOSE MODAL FUNCTION
    // ============================================
    function closeModal() {
        if (modal) modal.classList.remove("active");
        
        // Restore scroll
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
        
        currentCardData = null;
        isAddingFromModal = false;
    }
    
    // ============================================
    // ADD TO CART FROM MODAL
    // ============================================
    function addToCartFromModal(event) {
        // Prevent event bubbling
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        // Prevent double addition
        if (isAddingFromModal) return;
        isAddingFromModal = true;
        
        if (!currentCardData) {
            isAddingFromModal = false;
            return;
        }
        
        // Use CourtsideCart if available, otherwise fallback to localStorage
        if (typeof CourtsideCart !== 'undefined' && CourtsideCart.addItem) {
            // Use the professional cart module (toast handled by cart.js)
            CourtsideCart.addItem({
                name: currentCardData.name,
                price: currentCardData.price,
                img: currentCardData.img,
                rarity: currentCardData.rarity
            });
        } else {
            // Fallback: Direct localStorage access
            let cart = JSON.parse(localStorage.getItem('courtsideCart')) || [];
            
            const existingItem = cart.find(item => item.name === currentCardData.name);
            
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                cart.push({
                    id: Date.now(),
                    name: currentCardData.name,
                    price: parseInt(currentCardData.price) || 0,
                    quantity: 1,
                    img: currentCardData.img,
                    rarity: currentCardData.rarity
                });
            }
            
            localStorage.setItem('courtsideCart', JSON.stringify(cart));
            
            // Update cart badge if available
            updateCartBadgeUI();
        }
        
        // Visual feedback on modal button only (no toast notification)
        if (modalAddToCartBtn) {
            const originalText = modalAddToCartBtn.textContent;
            const originalBg = modalAddToCartBtn.style.background;
            modalAddToCartBtn.textContent = '✓ Added!';
            modalAddToCartBtn.style.background = '#22c55e';
            
            setTimeout(() => {
                modalAddToCartBtn.textContent = originalText;
                modalAddToCartBtn.style.background = originalBg;
                isAddingFromModal = false;
            }, 800);
        } else {
            setTimeout(() => {
                isAddingFromModal = false;
            }, 800);
        }
    }
    
    // ============================================
    // UPDATE CART BADGE UI
    // ============================================
    function updateCartBadgeUI() {
        const cart = JSON.parse(localStorage.getItem('courtsideCart')) || [];
        const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const badges = document.querySelectorAll('.cart-badge');
        
        badges.forEach(badge => {
            if (itemCount > 0) {
                badge.style.display = 'flex';
                badge.textContent = itemCount > 99 ? '99+' : itemCount;
            } else {
                badge.style.display = 'none';
            }
        });
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    // Close button
    if (modalClose) {
        // Remove existing listener to avoid duplicates
        const newCloseBtn = modalClose.cloneNode(true);
        modalClose.parentNode.replaceChild(newCloseBtn, modalClose);
        newCloseBtn.onclick = closeModal;
    }
    
    // Modal overlay click to close
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }
    
    // Modal Add to Cart button - Remove duplicate listeners
    if (modalAddToCartBtn) {
        // Clone and replace to remove all existing listeners
        const newModalBtn = modalAddToCartBtn.cloneNode(true);
        modalAddToCartBtn.parentNode.replaceChild(newModalBtn, modalAddToCartBtn);
        newModalBtn.addEventListener('click', addToCartFromModal);
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ============================================
// Re-initialize modal when new cards are added dynamically
// ============================================
const modalObserver = new MutationObserver(function(mutations) {
    let needsReinit = false;
    
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && (node.classList?.contains('card') || node.querySelector?.('.card'))) {
                    needsReinit = true;
                }
            });
        }
    });
    
    if (needsReinit) {
        // Small delay to ensure DOM is updated
        setTimeout(() => initModal(), 100);
    }
});

modalObserver.observe(document.body, { childList: true, subtree: true });