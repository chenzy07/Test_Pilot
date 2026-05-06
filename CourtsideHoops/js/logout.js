// js/logout.js - Universal Logout Handler
(async function() {
    'use strict';
    
    // Wait for Supabase to be available
    function initLogout() {
        if (typeof supabase === 'undefined') {
            setTimeout(initLogout, 100);
            return;
        }
        
        document.querySelectorAll('[data-logout]').forEach(btn => {
            // Remove old listeners to prevent duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    await supabase.auth.signOut();
                    // Clear any local data
                    localStorage.removeItem('courtsideCart');
                    localStorage.removeItem('courtsidehoops-supabase-session');
                    // Redirect to login
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    // Force redirect even if error
                    window.location.href = 'login.html';
                }
            });
        });
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogout);
    } else {
        initLogout();
    }
})();