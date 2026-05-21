// Common API fetch function
async function apiCall(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

// Check auth status
async function checkAuth() {
    try {
        const user = await apiCall('/auth/me');
        return user;
    } catch (error) {
        return null;
    }
}

// Handle Logout
async function logout() {
    try {
        await apiCall('/auth/logout', 'POST');
        window.location.href = '/login.html';
    } catch (error) {
        alert(error.message);
    }
}

function buildNavLink(url, label, isButton = false) {
    const active = window.location.pathname === url ? 'active' : '';
    const baseClass = isButton ? 'btn' : '';
    return `<a href="${url}" class="${baseClass} ${active}">${label}</a>`;
}

// Update UI based on auth state
async function updateNavbar() {
    const user = await checkAuth();
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (user) {
        const dashboardLink = user.role === 'admin' ? '/admin.html' : '/dashboard.html';
        navLinks.innerHTML = `
            ${buildNavLink(dashboardLink, 'Dashboard')}
            ${buildNavLink('/leaderboard.html', 'Leaderboard')}
            ${buildNavLink('/profile.html', 'Profile')}
            <a href="#" onclick="logout(); return false;">Logout</a>
        `;
    } else {
        navLinks.innerHTML = `
            ${buildNavLink('/login.html', 'Login', true)}
            ${buildNavLink('/signup.html', 'Sign Up', true)}
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
