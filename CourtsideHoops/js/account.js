// js/account-supabase.js - Connected Account Management

(async function() {
    'use strict';

    // Check authentication
    const session = await CourtsideAuth.initProtectedPage(['user', 'admin', 'staff', 'superadmin']);
    
    if (!session || !session.profile) {
        console.error('No authenticated session');
        return;
    }

    const { user, profile } = session;

    // ========== POPULATE PROFILE DATA ==========
    function populateProfileData() {
        // Set name
        document.querySelectorAll('[data-field="name"]').forEach(el => {
            if (el.tagName === 'P') el.textContent = profile.full_name || 'Not set';
            if (el.tagName === 'INPUT') el.value = profile.full_name || '';
        });

        // Set email
        document.querySelectorAll('[data-field="email"]').forEach(el => {
            if (el.tagName === 'P') el.textContent = profile.email || user.email;
            if (el.tagName === 'INPUT') el.value = profile.email || user.email;
        });

        // Set username
        document.querySelectorAll('[data-field="username"]').forEach(el => {
            if (el.tagName === 'P') el.textContent = profile.username || 'Not set';
            if (el.tagName === 'INPUT') el.value = profile.username || '';
        });

        // Set member since
        if (profile.member_since) {
            const memberDate = new Date(profile.member_since).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.querySelectorAll('.info-group').forEach(group => {
                const label = group.querySelector('label');
                if (label && label.textContent.includes('Member Since')) {
                    const p = group.querySelector('p');
                    if (p) p.textContent = memberDate;
                }
            });
        }

        // Set avatar
        if (profile.avatar_url) {
            const profilePic = document.getElementById('profilePic') || document.getElementById('profileImage');
            if (profilePic) profilePic.src = profile.avatar_url;
        }

        // Set role badge
        if (profile.role) {
            const roleBadge = document.querySelector('.role-badge-admin-profile');
            if (roleBadge) {
                roleBadge.textContent = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
            }
        }
    }

    // ========== PROFILE EDITING ==========
    const profileSection = document.getElementById('profile-section');
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const cancelBtn = document.getElementById('cancelProfileBtn');
    const profileActions = document.getElementById('profileActions');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    let originalData = {};

    function storeOriginalData() {
        profileSection?.querySelectorAll('.info-group').forEach(group => {
            const p = group.querySelector('p');
            const input = group.querySelector('input');
            if (p && input && input.dataset.field) {
                originalData[input.dataset.field] = p.textContent;
            }
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            profileSection?.classList.add('editing');
            if (profileActions) profileActions.style.display = 'flex';
            if (editBtn) editBtn.style.display = 'none';
            storeOriginalData();
            
            profileSection?.querySelectorAll('.info-group').forEach(group => {
                const p = group.querySelector('p');
                const input = group.querySelector('input');
                if (p && input && input.dataset.field) {
                    input.value = p.textContent;
                }
            });
            showToast('Edit mode activated', 'info');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const updates = {};
            
            profileSection?.querySelectorAll('.info-group').forEach(group => {
                const input = group.querySelector('input');
                if (input && input.dataset.field) {
                    const field = input.dataset.field;
                    if (field === 'name') updates.full_name = input.value;
                    if (field === 'username') updates.username = input.value;
                    // Email can only be changed through auth
                }
            });

            if (Object.keys(updates).length > 0) {
                const result = await CourtsideAuth.updateProfile(user.id, updates);
                
                if (result.success) {
                    // Update local profile
                    Object.assign(profile, result.profile);
                    populateProfileData();
                    
                    profileSection?.classList.remove('editing');
                    if (profileActions) profileActions.style.display = 'none';
                    if (editBtn) editBtn.style.display = 'inline-flex';
                    
                    showToast('Profile updated successfully!', 'success');
                } else {
                    showToast(result.message || 'Failed to update profile', 'error');
                }
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            profileSection?.querySelectorAll('.info-group').forEach(group => {
                const input = group.querySelector('input');
                if (input && input.dataset.field && originalData[input.dataset.field]) {
                    input.value = originalData[input.dataset.field];
                }
            });
            
            profileSection?.classList.remove('editing');
            if (profileActions) profileActions.style.display = 'none';
            if (editBtn) editBtn.style.display = 'inline-flex';
            showToast('Changes discarded', 'warning');
        });
    }

    // ========== PHOTO UPLOAD ==========
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Check file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                        showToast('File size must be less than 5MB', 'error');
                        return;
                    }

                    showToast('Uploading photo...', 'info');
                    
                    const result = await CourtsideAuth.uploadAvatar(user.id, file);
                    
                    if (result.success) {
                        profile.avatar_url = result.url;
                        const profilePic = document.getElementById('profilePic') || document.getElementById('profileImage');
                        if (profilePic) profilePic.src = result.url;
                        showToast('Profile photo updated!', 'success');
                    } else {
                        showToast('Failed to upload photo', 'error');
                    }
                }
            };
            input.click();
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', async () => {
            const result = await CourtsideAuth.updateProfile(user.id, { avatar_url: null });
            
            if (result.success) {
                profile.avatar_url = null;
                const profilePic = document.getElementById('profilePic') || document.getElementById('profileImage');
                if (profilePic) {
                    profilePic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=ef4444&color=fff&size=140&bold=true`;
                }
                showToast('Profile photo removed', 'warning');
            }
        });
    }

    // ========== PASSWORD CHANGE ==========
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', async () => {
            const currentPw = document.getElementById('currentPassword')?.value;
            const newPw = document.getElementById('newPassword')?.value;
            const confirmPw = document.getElementById('confirmPassword')?.value;

            if (!currentPw || !newPw || !confirmPw) {
                showToast('Please fill in all password fields', 'error');
                return;
            }

            if (newPw !== confirmPw) {
                showToast('Passwords do not match', 'error');
                return;
            }

            const validation = CourtsideAuth.validatePassword(newPw);
            if (!validation.valid) {
                showToast(validation.message, 'error');
                return;
            }

            const { error } = await supabase.auth.updateUser({
                password: newPw
            });

            if (error) {
                showToast('Failed to update password. Please try again.', 'error');
            } else {
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                showToast('Password updated successfully!', 'success');
            }
        });
    }

    // ========== 2FA TOGGLE ==========
    const enable2FABtn = document.getElementById('enable2FABtn');
    if (enable2FABtn) {
        enable2FABtn.addEventListener('click', () => {
            showToast('Two-Factor Authentication setup will be available soon', 'info');
        });
    }

    // ========== DELETE ACCOUNT ==========
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (confirm('⚠️ WARNING: This action is irreversible! Are you sure?')) {
                if (confirm('Please confirm again. This will permanently delete your account.')) {
                    showToast('Account deletion requested...', 'warning');
                    
                    // Note: Account deletion through Supabase requires server-side function
                    showToast('Please contact support to complete account deletion', 'info');
                }
            }
        });
    }

    // ========== TOAST NOTIFICATIONS ==========
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.success}"></i>
            <span class="toast-message">${message}</span>
            <i class="fas fa-times toast-close"></i>
        `;
        
        container.appendChild(toast);
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        });
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // ========== SECTION SWITCHING ==========
    window.showSection = function(sectionId, event) {
        document.querySelectorAll('.account-section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId)?.classList.add('active');
        
        document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
        if (event?.currentTarget) event.currentTarget.classList.add('active');
        
        showToast(`Switched to ${sectionId === 'profile-section' ? 'Profile' : 'Security'} section`, 'info');
    };

    // ========== INITIALIZE ==========
    populateProfileData();
    
    // Show welcome toast
    setTimeout(() => {
        showToast(`Welcome back, ${profile.full_name || 'User'}! 👋`, 'success');
    }, 500);

})();