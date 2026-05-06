// js/auth-supabase.js - Shared Auth Functions for All Pages

const CourtsideAuth = {
    
    // Get current user
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
    
    // Get user profile from database
    async getProfile() {
        const user = await this.getUser();
        if (!user) return null;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        return profile;
    },
    
    // Check if logged in
    async isLoggedIn() {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    },
    
    // Logout
    async logout() {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    },
    
    // Update UI with user data
    async updateNavUI() {
        const user = await this.getUser();
        const profile = await this.getProfile();
        
        // Update cart badge if on logged-in pages
        if (user) {
            const cartBadge = document.getElementById('cartBadge');
            if (cartBadge) {
                // Load cart count from database
                const { count } = await supabase
                    .from('cart_items')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);
                
                if (count > 0) {
                    cartBadge.style.display = 'flex';
                    cartBadge.textContent = count;
                }
            }
        }
        
        // Update profile picture if exists
        if (profile?.avatar_url) {
            const profilePics = document.querySelectorAll('.profile-pic, .profile-avatar');
            profilePics.forEach(img => {
                img.src = profile.avatar_url;
            });
        }
        
        return { user, profile };
    },
    
    // Protect page - redirect if not logged in
    async requireAuth() {
        const loggedIn = await this.isLoggedIn();
        if (!loggedIn) {
            window.location.href = 'login.html';
            return null;
        }
        return await this.getProfile();
    }
};