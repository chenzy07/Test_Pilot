// js/auth.js - Professional Supabase Authentication (COMPLETE)
(function() {
    'use strict';

    // ========== SESSION MANAGEMENT ==========
    const SESSION_KEY = "courtsidehoops-supabase-session";

    async function getCurrentSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Session error:', error);
            return null;
        }
        return session;
    }

    async function getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('User error:', error);
            return null;
        }
        return user;
    }

    async function getCurrentProfile() {
        const user = await getCurrentUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Profile error:', error);
            return null;
        }
        return profile;
    }

    // ========== AUTHENTICATION FUNCTIONS ==========
    
    async function signUp(username, email, password, fullName) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            return {
                success: true,
                user: data.user,
                message: 'Account created successfully! Please check your email to verify.'
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async function signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            const profile = await getProfile(data.user.id);

            return {
                success: true,
                user: data.user,
                profile: profile,
                session: data.session
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async function signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            localStorage.removeItem(SESSION_KEY);
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 300);
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, message: error.message };
        }
    }

    async function getProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }

    async function updateProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return { success: true, profile: data };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, message: error.message };
        }
    }

    async function uploadAvatar(userId, file) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/avatar.${fileExt}`;
            
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            await updateProfile(userId, { avatar_url: publicUrl });

            return { success: true, url: publicUrl };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, message: error.message };
        }
    }

    async function protectPage(allowedRoles = []) {
        const user = await getCurrentUser();
        
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }

        const profile = await getCurrentProfile();
        
        if (!profile) {
            await signOut();
            return null;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
            redirectByRole(profile.role);
            return null;
        }

        return { user, profile };
    }

    function redirectByRole(role) {
        const routes = {
            'admin': 'superadmin.html',
            'staff': 'admin-dashboard.html',
            'user': 'market.html'
        };
        
        const targetPath = routes[role] || 'market.html';
        
        if (!window.location.pathname.includes(targetPath)) {
            window.location.href = targetPath;
        }
    }

    function setupLogoutButtons() {
        document.querySelectorAll('[data-logout]').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await signOut();
            });
        });
    }

    async function populateUserUI(profile) {
        if (!profile) return;

        document.querySelectorAll('[data-auth-name]').forEach(el => {
            el.textContent = profile.full_name || profile.username;
        });

        document.querySelectorAll('[data-auth-role]').forEach(el => {
            el.textContent = profile.role;
        });

        document.querySelectorAll('[data-auth-username]').forEach(el => {
            el.textContent = profile.username;
        });

        if (profile.avatar_url) {
            document.querySelectorAll('.profile-pic, [data-auth-avatar]').forEach(img => {
                if (img.tagName === 'IMG') {
                    img.src = profile.avatar_url;
                }
            });
        }
    }

    async function initProtectedPage(allowedRoles = []) {
        const session = await protectPage(allowedRoles);
        
        if (session && session.profile) {
            await populateUserUI(session.profile);
        }
        
        setupLogoutButtons();
        return session;
    }

    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        if (password.length < minLength) {
            return { valid: false, message: 'Password must be at least 8 characters' };
        }
        if (!hasUpperCase) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!hasLowerCase) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!hasNumbers) {
            return { valid: false, message: 'Password must contain at least one number' };
        }

        return { valid: true, message: 'Password is strong' };
    }

    // ========== EXPORT FUNCTIONS ==========
    window.CourtsideAuth = {
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        getCurrentProfile,
        getCurrentSession,
        getProfile,
        updateProfile,
        uploadAvatar,
        protectPage,
        initProtectedPage,
        validatePassword,
        redirectByRole,
        setupLogoutButtons,
        populateUserUI
    };

})();

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Setup profile dropdown
    const profileMenu = document.querySelector('.profile-menu');
    const btn = document.querySelector('.profile-btn');
    const dropdown = document.querySelector('.dropdown');

    if (profileMenu && btn && dropdown) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            profileMenu.classList.remove('active');
        });

        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Setup logout buttons
    CourtsideAuth.setupLogoutButtons();

    // Check if on login page
    if (document.body.dataset.page === 'login') {
        initLoginPage();
    }

    // Check if on protected page
    const protectedRole = document.body.dataset.protectedRole;
    if (protectedRole) {
        const allowedRoles = protectedRole.split(',');
        CourtsideAuth.initProtectedPage(allowedRoles);
    }
});

// ========== LOGIN PAGE SPECIFIC LOGIC ==========
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const authBtn = document.getElementById('authBtn');
    const termsCheck = document.getElementById('termsCheck');
    
    let isSignup = false;

    window.toggleAuth = function() {
        isSignup = !isSignup;
        
        const nameField = document.getElementById('nameField');
        const confirmField = document.getElementById('confirmField');
        const titleText = document.getElementById('titleText');
        const forgotSection = document.getElementById('forgot');
        const toggleText = document.getElementById('toggleText');

        if (isSignup) {
            if (nameField) nameField.style.display = 'block';
            if (confirmField) confirmField.style.display = 'block';
            if (titleText) titleText.textContent = 'Create Account';
            if (authBtn) authBtn.textContent = 'Sign Up';
            if (forgotSection) forgotSection.style.display = 'none';
            if (toggleText) toggleText.innerHTML = 'Already have an account? <span onclick="toggleAuth()" id="toggleAction">Login</span>';
        } else {
            if (nameField) nameField.style.display = 'none';
            if (confirmField) confirmField.style.display = 'none';
            if (titleText) titleText.textContent = 'Welcome Back';
            if (authBtn) authBtn.textContent = 'Login';
            if (forgotSection) forgotSection.style.display = 'block';
            if (toggleText) toggleText.innerHTML = 'Don\'t have an account? <span onclick="toggleAuth()" id="toggleAction">Sign Up</span>';
        }
    };

    if (termsCheck && authBtn) {
        function updateButtonState() {
            const allowed = termsCheck.checked;
            authBtn.disabled = !allowed;
            authBtn.style.opacity = allowed ? '1' : '0.5';
            authBtn.style.cursor = allowed ? 'pointer' : 'not-allowed';
        }
        
        termsCheck.addEventListener('change', updateButtonState);
        updateButtonState();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (termsCheck && !termsCheck.checked) {
                showLoginMessage('Please agree to the Terms & Agreements', 'error');
                return;
            }

            // 🔥 FIXED: Changed 'username' to 'email'
            const email = document.getElementById('email')?.value?.trim();
            const password = document.getElementById('password')?.value;

            if (!email || !password) {
                showLoginMessage('Please fill in all fields', 'error');
                return;
            }

            if (isSignup) {
                const fullName = document.getElementById('fullname')?.value?.trim();
                const confirmPassword = document.getElementById('confirmPassword')?.value;
                const username = email.split('@')[0];

                if (!fullName) {
                    showLoginMessage('Please enter your full name', 'error');
                    return;
                }

                if (password !== confirmPassword) {
                    showLoginMessage('Passwords do not match', 'error');
                    return;
                }

                const validation = CourtsideAuth.validatePassword(password);
                if (!validation.valid) {
                    showLoginMessage(validation.message, 'error');
                    return;
                }

                showLoginMessage('Creating account...', 'info');
                const result = await CourtsideAuth.signUp(username, email, password, fullName);

                if (result.success) {
                    showLoginMessage(result.message, 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    showLoginMessage(result.message, 'error');
                }
            } else {
                // ============ LOGIN ============
                showLoginMessage('Logging in...', 'info');
                const result = await CourtsideAuth.signIn(email, password);

                if (result.success) {
                    showLoginMessage('Login successful! Redirecting...', 'success');
                    
                    setTimeout(() => {
                        CourtsideAuth.redirectByRole(result.profile?.role || 'user');
                    }, 1000);
                } else {
                    showLoginMessage(result.message, 'error');
                }
            }
        });
    }
}

// ========== HELPER FUNCTIONS ==========
function showLoginMessage(message, type = 'info') {
    const statusEl = document.getElementById('loginStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `login-status ${type}`;
        statusEl.style.display = 'block';
        
        if (type === 'success') {
            statusEl.style.color = '#22c55e';
            statusEl.style.background = '#f0fdf4';
        } else if (type === 'error') {
            statusEl.style.color = '#ef4444';
            statusEl.style.background = '#fef2f2';
        } else {
            statusEl.style.color = '#3b82f6';
            statusEl.style.background = '#eff6ff';
        }
    }
}

// ========== TERMS MODAL ==========
document.addEventListener('DOMContentLoaded', () => {
    const openTermsBtn = document.getElementById('openTerms');
    const closeTermsBtn = document.getElementById('closeTerms');
    const termsModal = document.getElementById('termsModal');
    const termsOverlay = document.getElementById('termsOverlay');

    if (openTermsBtn && termsModal && termsOverlay) {
        openTermsBtn.addEventListener('click', () => {
            termsModal.classList.add('active');
            termsOverlay.classList.add('active');
        });

        closeTermsBtn?.addEventListener('click', () => {
            termsModal.classList.remove('active');
            termsOverlay.classList.remove('active');
        });

        termsOverlay.addEventListener('click', () => {
            termsModal.classList.remove('active');
            termsOverlay.classList.remove('active');
        });
    }
});