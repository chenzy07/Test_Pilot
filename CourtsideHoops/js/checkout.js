function selectPayment(type) {
    const qrSection = document.getElementById('qr-section');
    const cardSection = document.getElementById('card-section');
    
    qrSection.innerHTML = '';
    qrSection.style.display = 'none';
    cardSection.style.display = 'none';
    
    const summary = CourtsideCart.getSummary();
    const total = summary.total;
    
    if (type === 'gcash') {
        qrSection.style.display = 'block';
        const qrContainer = document.createElement('div');
        qrContainer.style.textAlign = 'center';
        
        QRCode.toCanvas(document.createElement('canvas'), `COURTSIDE HOOPS PAYMENT\nAmount: ₱${total.toFixed(2)}\nReference: CH-${Date.now()}`, function(err, canvas) {
            qrContainer.innerHTML = '<h4> Scan to Pay with GCash</h4>';
            qrContainer.appendChild(canvas);
            qrContainer.innerHTML += `<p style="margin-top: 12px; font-size: 14px;"><strong>Amount: ₱${total.toLocaleString()}</strong></p>`;
            qrContainer.innerHTML += `<p style="font-size: 12px; color: var(--text-muted);">GCash Number: 0912 345 6789</p>`;
            qrSection.innerHTML = '';
            qrSection.appendChild(qrContainer);
        });
    }
    
    if (type === 'card') {
        cardSection.style.display = 'block';
    }
}

function processPayment() {
    alert('Payment processed successfully! Thank you for your purchase.');
    CourtsideCart.clearCart();
    CourtsideCart.closeCheckoutModal();
    // Re-render cart
    const container = document.getElementById('cart-container');
    if (container) CourtsideCart.renderCartPage(container);
}

function openCheckout() {
    if (CourtsideCart.getItemCount() === 0) {
        alert('Your cart is empty. Add some items first!');
        return;
    }
    CourtsideCart.openCheckoutModal();
}

function closeCheckout() {
    CourtsideCart.closeCheckoutModal();
}

// Expose functions globally
window.selectPayment = selectPayment;
window.processPayment = processPayment;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;